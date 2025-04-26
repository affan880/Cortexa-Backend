import { Router, Request, Response, NextFunction } from 'express';
import { createGmailTools } from '../utils/gmailUtils';
import { runGmailAgent } from '../agents/gmailAgent';
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Buffer } from 'buffer'; // Needed for base64 decoding

console.log("--- Loading src/routes/api.ts ---");

// --- Configuration --- 
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://192.168.1.79:11434"; // Replace with your Ollama host if different
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral"; // Or another model like llama3
const MAX_BODY_CHARS = 8000; // Increased limit for email body context

// --- Allowed Categories and Intents --- 
const ALLOWED_CATEGORIES = [
  "Direct Request/Question", "Information/Update", "Meeting/Appointment", 
  "Offer/Opportunity", "Promotion/Marketing", "Social/Personal", 
  "Application/Interview", "Notification/Alert", "Invoice/Billing", 
  "Feedback/Survey", "Other"
];

const ALLOWED_INTENT_TYPES = [
    "create_task", "draft_reply_email", "schedule_event", 
    "open_link", "review_document", "archive_email", // Added archive
    "unknown" // Fallback intent type
];

const router = Router();

// Common handler logic
const handleRequest = async (req: Request, res: Response, next: NextFunction, taskPromptTemplate: (threadId: string) => string) => {
  const { threadId, accessToken } = req.body;

  if (!threadId || !accessToken) {
    return res.status(400).json({ error: 'Missing threadId or accessToken in request body' });
  }

  try {
    // 1. Initialize Gmail Tools
    const tools = createGmailTools(accessToken);

    // 2. Create the specific prompt for the agent
    const input = taskPromptTemplate(threadId);
    console.log(`Processing thread ${threadId} with input: ${input}`);

    // 3. Run the LLM agent with tools
    const result = await runGmailAgent(input, tools);

    res.json(result);
  } catch (error) {
    console.error("Error processing request:", error);
    next(error); // Pass error to the global error handler
  }
};

// Define the list of default labels we want to ensure exist
const DEFAULT_LABEL_NAMES = [
  "Follow-up",
  "Work",
  "Finance",
  "Health",
  "Events",
  "Promotions",
  "Social",
  // "Spam" is typically a system label and cannot be created by users
];

/**
 * Checks for default labels and creates them if they don't exist.
 * @param auth Initialized OAuth2Client with user credentials
 * @returns Object containing lists of existing and newly created labels.
 */
async function ensureDefaultLabelsExist(auth: OAuth2Client): Promise<{ existingLabels: string[], createdLabels: { id: string, name: string }[], errors: any[] }> {
  const gmail = google.gmail({ version: 'v1', auth });
  const existingLabels: string[] = [];
  const createdLabels: { id: string, name: string }[] = [];
  const errors: any[] = [];

  console.log("Ensuring default labels exist...");

  try {
    // 1. Get current user labels
    console.log("Fetching existing labels...");
    const listResponse = await gmail.users.labels.list({ userId: 'me' });
    const currentLabels = listResponse.data.labels || [];
    // Create a set of existing label names for faster lookup (case-insensitive)
    const currentLabelNamesLower = new Set(currentLabels.map(label => label.name?.toLowerCase()));
    console.log(`Found ${currentLabels.length} existing labels.`);

    // 2. Check and create missing labels
    for (const labelName of DEFAULT_LABEL_NAMES) {
      const labelNameLower = labelName.toLowerCase();
      if (currentLabelNamesLower.has(labelNameLower)) {
        console.log(`Label '${labelName}' already exists.`);
        existingLabels.push(labelName);
      } else {
        console.log(`Label '${labelName}' not found, attempting to create...`);
        try {
          const createResponse = await gmail.users.labels.create({
            userId: 'me',
            requestBody: {
              name: labelName,
              labelListVisibility: 'labelShow', // Make visible in label list
              messageListVisibility: 'show', // Show in message list
            },
          });
          const newLabel = createResponse.data;
          if (newLabel.id && newLabel.name) {
            console.log(`Successfully created label '${newLabel.name}' with ID: ${newLabel.id}`);
            createdLabels.push({ id: newLabel.id, name: newLabel.name });
          } else {
            console.warn(`Label creation for '${labelName}' succeeded but response lacked ID or name.`);
            errors.push({ labelName: labelName, error: "Creation response lacked ID/Name" });
          }
        } catch (createError: any) {
          console.error(`Failed to create label '${labelName}':`, createError.message);
          // Add more specific error handling for rate limits if needed
          errors.push({ labelName: labelName, error: createError.message, details: createError.response?.data });
        }
      }
    }

  } catch (listError: any) {
    console.error("Failed to list existing labels:", listError.message);
    // If listing fails, we can't proceed
    errors.push({ operation: 'listLabels', error: listError.message, details: listError.response?.data });
    // Re-throw or handle differently if needed
    // throw listError; 
  }

  console.log("Default label check complete.");
  return { existingLabels, createdLabels, errors };
}

// Helper function to decode base64url
function base64UrlDecode(str: string): string {
    // Replace non-URL-safe chars and add padding if needed
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    try {
        return Buffer.from(base64, 'base64').toString('utf-8');
    } catch (e) {
        console.error("Base64URL decoding failed:", e);
        return ''; // Return empty string on error
    }
}

// Helper function to find the plain text body part
function getPlainTextBody(payload: any): string {
    let body = '';
    if (!payload) return body;

    let partsToProcess = [payload]; // Use a queue for breadth-first search
    let plainTextPart: any = null;
    let htmlPart: any = null; // Keep track of HTML as a fallback

    const processedPartIds = new Set(); // Avoid infinite loops with strange structures

    while (partsToProcess.length > 0) {
        const part = partsToProcess.shift(); // Process one part at a time

        if (!part || processedPartIds.has(part.partId)) {
            continue; // Skip if part is null or already processed
        }
        processedPartIds.add(part.partId); // Mark as processed

        if (part.mimeType === 'text/plain' && part.body?.data) {
            plainTextPart = part; // Found the best type
            break; // Prioritize plain text, stop searching this branch
        } else if (part.mimeType === 'text/html' && part.body?.data) {
            if (!htmlPart) { // Only store the first HTML part found as fallback
                htmlPart = part;
            }
        } else if (part.mimeType?.startsWith('multipart/alternative') && part.parts) {
            // Add sub-parts to the front of the queue (prefer later parts)
            partsToProcess = [...part.parts.slice().reverse(), ...partsToProcess];
        } else if (part.mimeType?.startsWith('multipart/') && part.parts) {
            // For other multipart types, add parts to the end of the queue
            partsToProcess = [...partsToProcess, ...part.parts];
        }
    }

    // Decode the best found part (prefer plain text)
    const partToDecode = plainTextPart || htmlPart;
    if (partToDecode?.body?.data) {
        body = base64UrlDecode(partToDecode.body.data);
        // Basic HTML stripping if we fell back to HTML
        if (!plainTextPart && htmlPart && partToDecode.mimeType === 'text/html') {
            body = body
                .replace(/<style[^>]*>.*?<\/style>/gis, '')
                .replace(/<script[^>]*>.*?<\/script>/gis, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s{2,}/g, ' ')
                .trim();
        }
    } else if (payload.body?.data && !payload.mimeType?.startsWith('multipart')) {
        // Fallback for simple, non-multipart emails (could be plain or html)
        body = base64UrlDecode(payload.body.data);
        if (payload.mimeType === 'text/html') {
            body = body
                .replace(/<style[^>]*>.*?<\/style>/gis, '')
                .replace(/<script[^>]*>.*?<\/script>/gis, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s{2,}/g, ' ')
                .trim();
        }
    }

    return body.trim();
}

// --- Helper Function: Extract Attachments --- 
function getAttachmentInfo(payload: any): { filename: string; mime_type: string }[] {
    const attachments: { filename: string; mime_type: string }[] = [];
    const parts = payload?.parts || [];
    const processedPartIds = new Set(); // Prevent infinite loops

    const findAttachmentsRecursive = (currentPart: any) => {
        if (!currentPart || processedPartIds.has(currentPart.partId)) {
            return;
        }
        processedPartIds.add(currentPart.partId);

        // Check if this part is an attachment
        if (currentPart.filename && currentPart.filename.length > 0 && currentPart.body?.attachmentId) {
            attachments.push({
                filename: currentPart.filename,
                mime_type: currentPart.mimeType || 'application/octet-stream'
            });
        }

        // Recurse if this part contains other parts
        if (currentPart.parts) {
            currentPart.parts.forEach(findAttachmentsRecursive);
        }
    };

    // Start the recursive search from the main payload
    // If the main payload itself is an attachment (less common)
    if (payload.filename && payload.filename.length > 0 && payload.body?.attachmentId) {
       attachments.push({
           filename: payload.filename,
           mime_type: payload.mimeType || 'application/octet-stream'
       });
    }
    // Search within parts
    parts.forEach(findAttachmentsRecursive);

    return attachments;
}

// --- API Endpoints --- 

router.post('/summarize-thread', (req, res, next) => {
  console.log("--- Reached POST /summarize-thread handler ---");
  handleRequest(req, res, next, (threadId) => 
    `Use the gmail_get_thread tool to fetch the content of the Gmail thread with ID '${threadId}'. Then, summarize the key points.`
  );
});

router.post('/extract-tasks', (req, res, next) => {
  handleRequest(req, res, next, (threadId) => 
    `Use the gmail_get_thread tool to fetch the content of the Gmail thread with ID '${threadId}'. Then, extract all action items and tasks mentioned. List them clearly.`
  );
});

router.post('/follow-up-suggestions', (req, res, next) => {
  handleRequest(req, res, next, (threadId) => 
    `Use the gmail_get_thread tool to fetch the content of the Gmail thread with ID '${threadId}'. Then, review it and suggest potential follow-up actions or emails needed.`
  );
});

// Endpoint to list recent emails (using the agent)
router.post('/list-emails', async (req, res, next) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Missing accessToken in request body' });
  }

  try {
    // 1. Initialize Gmail Tools (including GmailSearch via createGmailTools)
    console.log("Initializing tools for /list-emails...");
    const tools = createGmailTools(accessToken);

    // 2. Define the prompt for the agent
    const input = `Use the gmail_search tool to find the 10 most recent emails in the inbox. List their subject, sender, and a snippet.`;
    console.log(`Asking agent to list recent emails with input: ${input}`);

    // 3. Run the LLM agent with tools
    const result = await runGmailAgent(input, tools);

    console.log("/list-emails agent executed successfully.");
    res.json(result); 

  } catch (error) {
    // Log the specific error from the agent call
    console.error("Error processing /list-emails agent request:", error);
    // Pass to global error handler 
    next(error); 
  }
});

// --- Analyze Emails Endpoint --- 

router.post('/analyze-emails', async (req, res, next) => {
  // Read access token and optional parameters from request body
  const { accessToken, days, count } = req.body;
  console.log("--- Reached POST /analyze-emails handler ---");
  console.log(`Received params -> days: ${days}, count: ${count}`);

  // Define defaults and limits
  const DEFAULT_DAYS = 7;
  const MAX_ALLOWED_COUNT = 100; // Set a reasonable upper limit for count
  const MAX_ALLOWED_DAYS = 90; // Set a reasonable upper limit for days
  const DEFAULT_MAX_RESULTS_FOR_DAYS = 50; // Max results when using 'days'

  const CATEGORIES = ["Finance", "Promotions", "Work", "Social", "Events", "Other"];

  if (!accessToken) {
    return res.status(400).json({ error: 'Missing accessToken in request body' });
  }

  // Validate optional parameters
  const numDays = (days && Number.isInteger(Number(days)) && Number(days) > 0) ? Math.min(Number(days), MAX_ALLOWED_DAYS) : DEFAULT_DAYS;
  const emailCount = (count && Number.isInteger(Number(count)) && Number(count) > 0) ? Math.min(Number(count), MAX_ALLOWED_COUNT) : null;

  console.log(`Effective params -> numDays: ${numDays}, emailCount: ${emailCount}`);

  try {
    // Step 1: Create OAuth2 client
    console.log("Creating OAuth2 client for Google API call...");
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Step 2: Ensure default labels exist (Optional, keep if needed)
    console.log("Calling ensureDefaultLabelsExist function...");
    const labelCheckResult = await ensureDefaultLabelsExist(oauth2Client);
    if (labelCheckResult.errors.length > 0) {
      console.warn("Errors encountered during label check/creation:", labelCheckResult.errors);
    }
    console.log("Label check/creation process complete.");
    const allLabelNames = [...labelCheckResult.existingLabels, ...labelCheckResult.createdLabels.map(l => l.name)];

    // Step 3: Fetch emails based on provided params or defaults
    console.log("Fetching emails...");
    let messageListParams: any = { userId: 'me' };

    if (emailCount) {
      // Prioritize count if provided
      console.log(`Fetching specific count: ${emailCount}`);
      messageListParams.maxResults = emailCount;
      // Optionally, add 'in:inbox' or other filters if desired when using count
      // messageListParams.q = 'in:inbox'; 
    } else {
      // Use days if count is not provided
      console.log(`Fetching emails from last ${numDays} days...`);
      const timestamp = Math.floor((Date.now() - numDays * 24 * 60 * 60 * 1000) / 1000);
      messageListParams.q = `after:${timestamp}`;
      messageListParams.maxResults = DEFAULT_MAX_RESULTS_FOR_DAYS; // Use a default max when filtering by days
    }

    const messageListResponse = await gmail.users.messages.list(messageListParams);
    const messages = messageListResponse.data.messages || [];
    if (messages.length === 0) {
      return res.json({ message: `No emails found matching the criteria (count: ${emailCount}, days: ${numDays}).`, categorizedEmails: {} });
    }
    console.log(`Found ${messages.length} emails to process.`);

    // Step 4: Initialize Ollama Client (Pointing to Windows IP)
    const ollamaHost = "http://192.168.1.79:11434"; // <-- Use Windows IP Address
    const ollamaModel = "mistral"; 
    console.log(`Initializing Ollama model ${ollamaModel} at ${ollamaHost}...`);
    const ollama = new ChatOllama({ baseUrl: ollamaHost, model: ollamaModel, temperature: 0.1 });

    // Step 5: Fetch details, categorize, and collect results grouped by category
    const categorizedEmails: { [key: string]: any[] } = {}; // Initialize object for grouping
    console.log("Processing emails one by one...");

    // Pre-create maps for faster lookup
    const userLabelToCategoryMap = new Map<string, string>();
    CATEGORIES.forEach(cat => userLabelToCategoryMap.set(`Label_${cat.toUpperCase()}`, cat)); // Assuming labels created are Label_WORK etc.
    const gmailCategoryMap = new Map<string, string>([
        ["CATEGORY_PROMOTIONS", "Promotions"],
        ["CATEGORY_SOCIAL", "Social"],
        ["CATEGORY_UPDATES", "Other"], // Map Updates to Other or a more suitable category
        ["CATEGORY_FORUMS", "Other"], // Map Forums to Other or Social
    ]);

    for (const messageHeader of messages) {
        if (!messageHeader.id) continue;
        let category = "Processing Error"; // Default category if something goes wrong
        let emailData: any = {
            messageId: messageHeader.id,
            threadId: messageHeader.threadId || null,
            subject: `Error Processing ID: ${messageHeader.id}`,
            from: "", date: "", body: "", labelIds: []
        };

        try {
            console.log(`Fetching details for message ID: ${messageHeader.id}...`);
            const messageResponse = await gmail.users.messages.get({ userId: 'me', id: messageHeader.id, format: 'full' });
            const payload = messageResponse.data.payload;
            emailData.labelIds = messageResponse.data.labelIds || [];
            emailData.threadId = messageResponse.data.threadId || emailData.threadId;

            if (!payload || !payload.headers) {
                emailData.error = "Missing payload or headers";
                category = "Extraction Failed";
            } else {
                const headers = payload.headers;
                const subjectHeader = headers.find(h => h.name === 'Subject');
                const fromHeader = headers.find(h => h.name === 'From');
                const dateHeader = headers.find(h => h.name === 'Date');
                emailData.subject = subjectHeader?.value || 'No Subject';
                emailData.from = fromHeader?.value || 'Unknown Sender';
                emailData.date = dateHeader?.value ? new Date(dateHeader.value).toISOString().split('T')[0] : 'Unknown Date';
                const body = getPlainTextBody(payload) || messageResponse.data.snippet || '';
                emailData.body = body.substring(0, 500) + (body.length > 500 ? '...' : ''); // Limit snippet size

                // --- Improved Categorization Logic ---
                let foundCategory = false;

                // 1. Check for existing user-defined labels
                for (const labelId of emailData.labelIds) {
                    if (userLabelToCategoryMap.has(labelId)) {
                        category = userLabelToCategoryMap.get(labelId)!;
                        console.log(` -> Category from user label (${labelId}): ${category}`);
                        foundCategory = true;
                        break;
                    }
                }

                // 2. Check for Gmail system category labels (if no user label found)
                if (!foundCategory) {
                    for (const labelId of emailData.labelIds) {
                        if (gmailCategoryMap.has(labelId)) {
                            category = gmailCategoryMap.get(labelId)!;
                            console.log(` -> Category from Gmail label (${labelId}): ${category}`);
                            foundCategory = true;
                            break;
                        }
                    }
                }

                // 3. Use LLM as fallback or if body is missing
                if (!foundCategory || !body) {
                    if (!body && !foundCategory) {
                       console.warn(`Could not extract plain text body for message ID: ${messageHeader.id}. Skipping LLM categorization, using 'Other'.`);
                       category = "Other"; 
                       emailData.error = "Could not extract plain text body";
                    } else if (!foundCategory) {
                      console.log(`Categorizing via LLM: "${emailData.subject}" from ${emailData.from}...`);
                      const categorizationPrompt = 
                      `Given the following email details and existing labels, categorize this email into ONE of these categories: ${CATEGORIES.join(", ")}.
                      Consider the labels as strong hints. Prioritize specific categories over 'Other' if applicable.
                      
                      Existing Labels: [${emailData.labelIds.join(", ")}]
                      Sender: ${emailData.from}
                      Subject: ${emailData.subject}
                      Body Snippet: ${emailData.body}
                      
                      Respond ONLY with the single category name.
                      `;
                      const categoryResponse = await ollama.invoke(categorizationPrompt);
                      let rawCategory = categoryResponse.content.toString().trim();
                      const matchedCategory = CATEGORIES.find(c => rawCategory.toLowerCase() === c.toLowerCase());
                      category = matchedCategory || "Other";
                      console.log(` -> LLM assigned category: ${category}`);
                    }
                } 
            }
        } catch (msgError: any) {
            console.error(`Failed to process message ID ${messageHeader.id}:`, msgError.message);
            category = "Processing Error";
            emailData.error = msgError.message;
        }

        // Add the email data to the correct category array
        if (!categorizedEmails[category]) {
            categorizedEmails[category] = [];
        }
        if (category === "Processing Error" || category === "Extraction Failed") {
           // Keep the error field for these
        } else {
           delete emailData.error; // Remove error field if successfully categorized
        }
        categorizedEmails[category].push(emailData);
    }

    console.log("Email analysis complete. Returning categorized results.");
    res.json({ message: "Email analysis completed.", categorizedEmails }); // Return the grouped object

  } catch (error) {
    console.error("Error processing /analyze-emails request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let googleApiErrorDetails: any = {};
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as any).response;
      if(response && typeof response === 'object' && 'data' in response) {
        googleApiErrorDetails = response.data;
      }
    }
    res.status(500).json({
        error: "Failed during email analysis",
        details: errorMessage,
        googleApiError: googleApiErrorDetails
    });
  }
});

// --- Summarize Email Endpoint ---
router.post('/summarize-email', async (req, res) => {
  console.log("--- Reached POST /summarize-email handler ---");
  
  try {
    // Extract data from request body
    const { emailSubject, emailBody, senderEmail, returnHtml = false } = req.body;
    
    // Basic validation
    if (!emailBody) {
      return res.status(400).json({ error: 'Missing emailBody in request body' });
    }
    
    // Initialize Ollama client for Mistral
    const ollamaHost = "http://192.168.1.79:11434"; 
    const ollamaModel = "mistral";
    console.log(`Initializing Ollama model ${ollamaModel} at ${ollamaHost}...`);
    const ollama = new ChatOllama({ baseUrl: ollamaHost, model: ollamaModel, temperature: 0.7 });

    // Extract plain text from HTML if needed
    let plainTextBody = emailBody;
    if (emailBody.includes('<html') || emailBody.includes('<body') || emailBody.includes('<div')) {
      // Simple HTML stripping - for more complex HTML, consider using a proper HTML parser
      plainTextBody = emailBody
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    // Create the prompt with email details
    const summarizationPrompt = `
Summarize the following email in a playful, informal, and witty tone. Be direct, engaging, and a little cheeky. Keep it under 100 words.

${emailSubject ? `Subject: ${emailSubject}\n` : ''}
${senderEmail ? `From: ${senderEmail}\n` : ''}
Email:
${plainTextBody}
    `;

    console.log("Sending email to Mistral for summarization...");
    const summaryResponse = await ollama.invoke(summarizationPrompt);
    const summaryText = summaryResponse.content.toString().trim();
    
    console.log("Summary generated successfully.");
    
    // Return either plain text or HTML-formatted summary based on returnHtml parameter
    if (returnHtml) {
      const htmlSummary = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 16px;
      margin: 0;
      color: #333;
      line-height: 1.5;
    }
    .summary {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
    .summary p {
      margin: 0 0 12px 0;
    }
  </style>
</head>
<body>
  <div class="summary">
    <p>${summaryText.replace(/\n/g, '</p><p>')}</p>
  </div>
</body>
</html>`;
      res.json({ summary: summaryText, html: htmlSummary });
    } else {
      res.json({ summary: summaryText });
    }
    
  } catch (error: any) {
    console.error("Error in /summarize-email endpoint:", error);
    res.status(500).json({ 
      error: 'Failed to summarize email', 
      details: error.message || 'Unknown error' 
    });
  }
});

// --- Detect Email Intent Endpoint ---
router.post('/detect-intent', async (req, res) => {
  console.log("--- Reached POST /detect-intent handler ---");
  
  try {
    // Extract data from request body
    const { accessToken, messageId } = req.body;
    
    // Basic validation
    if (!accessToken) {
      return res.status(400).json({ error: 'Missing accessToken in request body' });
    }
    if (!messageId) {
      return res.status(400).json({ error: 'Missing messageId in request body' });
    }
    
    // Step 1: Create OAuth2 client for Gmail API
    console.log("Setting up OAuth client...");
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Step 2: Fetch email details using messageId
    console.log(`Fetching details for message ID: ${messageId}...`);
    let messageResponse;
    try {
      messageResponse = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });
    } catch (fetchError: any) {
        console.error("Error fetching email from Gmail:", fetchError);
        const status = fetchError.code === 404 ? 404 : 500; // Adjust status based on error
        return res.status(status).json({
             error: 'Failed to fetch email details from Gmail',
             details: fetchError.message || 'Unknown Gmail API error'
        });
    }

    const payload = messageResponse.data.payload;
    if (!payload || !payload.headers) {
      console.error(`No payload or headers found for message ID: ${messageId}`);
      return res.status(404).json({ error: 'Email content not found or invalid format' });
    }
    
    // Extract email subject and body
    const headers = payload.headers;
    const subjectHeader = headers.find(h => h.name === 'Subject');
    const fromHeader = headers.find(h => h.name === 'From');
    const dateHeader = headers.find(h => h.name === 'Date');

    const emailSubject = subjectHeader?.value || 'No Subject';
    const emailFrom = fromHeader?.value || 'Unknown Sender';
    const emailDateReceived = dateHeader?.value ? new Date(dateHeader.value).toISOString() : new Date().toISOString();

    // Extract body using the helper function
    const fullBody = getPlainTextBody(payload) || messageResponse.data.snippet || '';
    const emailBody = fullBody.substring(0, MAX_BODY_CHARS); // Limit body length
    if (!emailBody && fullBody.length > 0){
        console.warn(`Could not extract plain text body for message ID: ${messageId}. Limited context might be used.`);
    } else if (!emailBody && fullBody.length === 0) {
        console.warn(`Could not extract *any* body or snippet for message ID: ${messageId}. Analysis might fail.`);
        // Optionally return an error here if body is essential
    }

    // Extract attachment info
    const attachments = getAttachmentInfo(payload);
    const attachmentListString = attachments.length > 0
        ? attachments.map(a => `${a.filename} (${a.mime_type})`).join(', ')
        : 'None';

    // 6. Initialize Ollama client
    console.log(`Initializing Ollama model ${OLLAMA_MODEL} at ${OLLAMA_HOST}...`);
    const ollama = new ChatOllama({
      baseUrl: OLLAMA_HOST,
      model: OLLAMA_MODEL,
      temperature: 0.1, // Lower temperature for more deterministic structured output
      format: "json", // Request JSON format directly if supported by Ollama version/model
    });

    // 7. Create the *structured* prompt
    const intentPrompt = `
You are an AI assistant analyzing emails to help a user quickly understand their purpose and identify required actions for task management. Your goal is to provide a structured summary containing the email's category and a list of structured actions.

**Instructions:**

1.  Analyze the **Email Context** provided below.
2.  Determine the primary **\`category\`**. Choose the *single best fit* from this list: ${ALLOWED_CATEGORIES.map(c => `\`${c}\``).join(', ')}.
3.  Identify all distinct and actionable items or key information points. For each, create a JSON object with the following keys:
    * **\`intent_type\`**: Classify the action. Choose the *single best fit* from: ${ALLOWED_INTENT_TYPES.map(i => `\`${i}\``).join(', ')}. Use \`unknown\` if unsure or if it's just informational but worth noting.
    * **\`description\`**: A concise, human-readable summary of the action or information point (e.g., "Reply with availability by Friday", "Review attached Q3 report", "Meeting scheduled for Tuesday at 10 AM"). Start actions with a verb.
    * **\`details\`**: An optional JSON object containing structured data relevant to the intent. Provide details *only if clearly present* in the email. Possible keys include:
        * For \`create_task\`: \`suggested_title\` (string), \`due_date_hint\` (string, e.g., "Tomorrow", "2025-10-25")
        * For \`draft_reply_email\`: \`topic\` (string), \`deadline\` (string), \`recipient_hint\` (string)
        * For \`schedule_event\`: \`event_title\` (string), \`date_time_text\` (string, e.g., "next Tuesday at 3pm"), \`date_time_iso\` (string, ISO 8601 if possible), \`location_hint\` (string)
        * For \`open_link\`: \`url\` (string), \`link_description\` (string)
        * For \`review_document\`: \`document_hint\` (string, e.g., "attached PDF", "report"), \`deadline\` (string)
        * (No specific details needed for \`archive_email\` or \`unknown\`)
4.  If no specific actions or key information points are found, return an empty list for \`structured_actions\`.
5.  Respond *only* with a single, valid JSON object containing exactly two keys: \`category\` (string) and \`structured_actions\` (a list of the JSON objects described above). Do not add explanations, greetings, or any text outside the JSON structure.

**Email Context:**
---
Sender: ${emailFrom}
Subject: ${emailSubject}
Date: ${emailDateReceived}
Attachments: ${attachmentListString}
Content:
${emailBody}
---

**JSON Output:**
`;

    // 8. Invoke Ollama
    console.log("Analyzing email for structured actions...");
    let analysisResponse;
    try {
        analysisResponse = await ollama.invoke(intentPrompt);
    } catch (ollamaError: any) {
        console.error("Error calling Ollama:", ollamaError);
        return res.status(502).json({ // Bad Gateway - error interacting with downstream service
            error: 'Failed to get response from AI model',
            details: ollamaError.message || 'Unknown Ollama error'
        });
    }

    const responseText = (typeof analysisResponse.content === 'string' ? analysisResponse.content : JSON.stringify(analysisResponse.content)).trim();
    console.log("Raw LLM response received.");
    // console.log("Raw LLM response:", responseText); // Uncomment for debugging

    // 9. Parse and validate the structured response
    let analysisData;
    try {
      // Attempt to parse directly if format="json" worked, otherwise find JSON block
       try {
           analysisData = JSON.parse(responseText);
       } catch (directParseError) {
           console.log("Direct JSON parsing failed, attempting to extract from text...");
           const jsonMatch = responseText.match(/{.*}/s); // Use /s for dotall matching
           if (jsonMatch && jsonMatch[0]) {
               analysisData = JSON.parse(jsonMatch[0]);
           } else {
               throw new Error("No valid JSON object found in LLM response.");
           }
       }

      // --- Deep Validation --- 
      if (typeof analysisData !== 'object' || analysisData === null) {
        throw new Error("LLM response is not a valid object.");
      }

      // Validate Category
      if (!analysisData.hasOwnProperty('category') || typeof analysisData.category !== 'string') {
          console.warn("LLM response missing 'category' or invalid type. Defaulting category.");
          analysisData.category = "Other"; // Default category
      } else if (!ALLOWED_CATEGORIES.includes(analysisData.category)) {
          console.warn(`LLM returned invalid category '${analysisData.category}'. Defaulting to 'Other'.`);
          analysisData.category = "Other";
      }

      // Validate structured_actions (should be an array)
      if (!analysisData.hasOwnProperty('structured_actions') || !Array.isArray(analysisData.structured_actions)) {
          console.warn("LLM response missing 'structured_actions' or not an array. Defaulting to empty list.");
          analysisData.structured_actions = [];
      } else {
          // Validate each action object within the array
          analysisData.structured_actions = analysisData.structured_actions.map((action: any, index: number) => {
              if (typeof action !== 'object' || action === null) {
                  console.warn(`Action item at index ${index} is not an object. Skipping.`);
                  return null; // Mark for removal
              }
              if (!action.hasOwnProperty('intent_type') || typeof action.intent_type !== 'string') {
                  console.warn(`Action item at index ${index} missing 'intent_type' or invalid type. Defaulting intent.`);
                  action.intent_type = "unknown"; // Default intent
              } else if (!ALLOWED_INTENT_TYPES.includes(action.intent_type)) {
                  console.warn(`Action item at index ${index} has invalid intent_type '${action.intent_type}'. Defaulting.`);
                  action.intent_type = "unknown";
              }

              if (!action.hasOwnProperty('description') || typeof action.description !== 'string' || action.description.trim() === '') {
                  console.warn(`Action item at index ${index} missing or empty 'description'. Setting default.`);
                  // If intent is unknown, maybe skip, otherwise provide default text
                  if (action.intent_type === 'unknown') return null; 
                  action.description = `Action item ${index + 1} (Description missing)`; 
              }

              // Ensure 'details' is an object if present, otherwise make it null or empty object
              if (action.hasOwnProperty('details') && (typeof action.details !== 'object' || action.details === null)) {
                  console.warn(`Action item at index ${index} has invalid 'details'. Resetting.`);
                  action.details = {};
              } else if (!action.hasOwnProperty('details')) {
                  action.details = {}; // Ensure details object exists, even if empty
              }

              return action; // Keep the validated/corrected action
          }).filter((action: any) => action !== null); // Remove items that were not valid objects or lacked essential info
      }
      // --- End Deep Validation --- 

      console.log("Email analysis complete and validated.");
      res.status(200).json({
        message: "Email analysis complete.",
        category: analysisData.category,
        structured_actions: analysisData.structured_actions
      });

    } catch (parseError: any) {
      console.error("Failed to parse or validate LLM response:", parseError);
      console.log("Raw LLM response was:", responseText);
      // Fallback response if parsing/validation fails
      res.status(500).json({ // Indicate server-side issue with parsing
        message: "Email analysis failed due to LLM response format issues.",
        category: "Other", 
        structured_actions: []
      });
    }

  } catch (error: any) {
    console.error("Error in /detect-intent endpoint processing:", error);
    res.status(500).json({ 
      error: 'Internal Server Error during email analysis',
      details: error.message || 'Unknown error'
    });
  }
});

// --- Generate Email Endpoint ---
router.post('/generate-email', async (req, res) => {
  console.log("--- Reached POST /generate-email handler ---");
  
  try {
    // Extract data from request body
    const { 
      subject, 
      body, 
      recipientEmail, 
      tone = 'professional' // Default tone
    } = req.body;
    
    // Initialize Ollama client for Mistral
    const ollamaHost = "http://192.168.1.79:11434"; 
    const ollamaModel = "mistral";
    console.log(`Initializing Ollama model ${ollamaModel} at ${ollamaHost}...`);
    const ollama = new ChatOllama({ baseUrl: ollamaHost, model: ollamaModel, temperature: 0.7 });

    // Create the prompt for email generation
    const emailPrompt = `
Generate a professional email with the following parameters:
${subject ? `Subject: ${subject}\n` : ''}
${recipientEmail ? `Recipient: ${recipientEmail}\n` : ''}
${body ? `Context/Key Points to include:\n${body}\n` : ''}
Tone: ${tone}

Please generate:
1. A clear and concise subject line (if not provided)
2. A well-structured email body
3. Appropriate greeting and closing
4. Maintain the specified tone throughout
5. Include all necessary information from the context
6. Keep it professional and engaging

Format the response as a JSON object with 'subject' and 'body' fields.
    `;

    console.log("Sending request to Mistral for email generation...");
    const response = await ollama.invoke(emailPrompt);
    const generatedEmail = response.content.toString().trim();
    
    // Parse the response to ensure it's valid JSON
    let emailContent;
    try {
      emailContent = JSON.parse(generatedEmail);
    } catch (parseError) {
      // If parsing fails, create a structured response from the raw text
      const lines = generatedEmail.split('\n');
      emailContent = {
        subject: lines[0].replace('Subject:', '').trim(),
        body: lines.slice(1).join('\n').trim()
      };
    }
    
    console.log("Email generated successfully.");
    
    // Return the generated email
    res.json({ 
      subject: emailContent.subject,
      body: emailContent.body,
      raw: generatedEmail // Include raw response for debugging
    });
    
  } catch (error: any) {
    console.error("Error in /generate-email endpoint:", error);
    res.status(500).json({ 
      error: 'Failed to generate email', 
      details: error.message || 'Unknown error' 
    });
  }
});

export default router; 