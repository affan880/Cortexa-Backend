import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const router = Router();

// --- Helper Function to get Authenticated Gmail Client ---
// const getGmailClient = (accessToken: string): any => { // Using any for brevity, replace with specific Gmail type if preferred
//     if (!accessToken) {
//         throw new Error('Access Token is required');
//     }
//     const oauth2Client = new google.auth.OAuth2();
//     oauth2Client.setCredentials({ access_token: accessToken });
//     return google.gmail({ version: 'v1', auth: oauth2Client });
// };

// --- Helper Function to Extract Access Token ---
// In a real app, use proper middleware and error handling
// const extractToken = (req: Request): string | undefined => {
//     const authHeader = req.headers.authorization;
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//         return authHeader.substring(7); // Remove 'Bearer '
//     }
//     // Fallback: Check request body (less common for GET, but might be used)
//     if (req.body && req.body.accessToken) {
//         return req.body.accessToken;
//     }
//     // Fallback: Check query parameters (least secure, avoid if possible)
//     if (req.query && typeof req.query.accessToken === 'string') {
//         return req.query.accessToken;
//     }
//     return undefined;
// };

// --- Error Handling Middleware (Basic Example) ---
// const handleGmailApiError = (err: any, res: Response) => {
//     console.error("Gmail API Error:", err.response?.data || err.message);
//     const status = err.code || err.response?.status || 500;
//     res.status(status).json({
//         error: "Failed to interact with Gmail API",
//         details: err.response?.data?.error?.message || err.message || 'Unknown error'
//     });
// };

// --- Helper Function to build Raw Email String ---
const buildRawEmail = (
    to: string | string[], 
    from: string, // Need sender email for headers
    subject: string, 
    body: string, 
    attachments?: { filename: string; mimeType: string; content: string }[],
    cc?: string | string[],
    bcc?: string | string[]
): string => {

    const boundary = `----=_Part_${Math.random().toString(16).substring(2)}`;
    const nl = '\r\n'; // RFC 2822 newline

    let rawEmail = `From: ${from}${nl}`;
    rawEmail += `To: ${Array.isArray(to) ? to.join(', ') : to}${nl}`;
    if (cc && cc.length > 0) {
        rawEmail += `Cc: ${Array.isArray(cc) ? cc.join(', ') : cc}${nl}`;
    }
    if (bcc && bcc.length > 0) {
        // Note: BCC should NOT be in the headers sent, Gmail handles it via API
        // If sending via raw SMTP, BCC header is added then removed before sending.
        // For Gmail API, we omit it from headers.
    }
    rawEmail += `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=${nl}`; // Encode subject for non-ASCII
    rawEmail += `MIME-Version: 1.0${nl}`;

    // --- Determine overall content type --- 
    const hasAttachments = attachments && attachments.length > 0;
    const contentType = hasAttachments 
        ? `multipart/mixed; boundary=\"${boundary}\"` 
        : 'text/plain; charset=\"UTF-8\"';
    rawEmail += `Content-Type: ${contentType}${nl}${nl}`;

    // --- Add Body Part --- 
    if (hasAttachments) {
        rawEmail += `--${boundary}${nl}`;
        rawEmail += `Content-Type: text/plain; charset=\"UTF-8\"${nl}`; 
        rawEmail += `Content-Transfer-Encoding: base64${nl}${nl}`; // Encode body as base64 too for simplicity with attachments
        rawEmail += Buffer.from(body).toString('base64').replace(/(.{76})/g, `$1${nl}`); // Add line breaks for base64
        rawEmail += nl;
    } else {
        // If no attachments, the body is the main content
        rawEmail += Buffer.from(body).toString('base64').replace(/(.{76})/g, `$1${nl}`);
        rawEmail += nl;
        return rawEmail; // No further boundaries needed
    }

    // --- Add Attachment Parts --- 
    if (hasAttachments) {
        attachments.forEach(att => {
            rawEmail += `--${boundary}${nl}`;
            rawEmail += `Content-Type: ${att.mimeType}; name=\"${att.filename}\"${nl}`;
            rawEmail += `Content-Transfer-Encoding: base64${nl}`;
            rawEmail += `Content-Disposition: attachment; filename=\"${att.filename}\"${nl}${nl}`;
            rawEmail += att.content.replace(/(.{76})/g, `$1${nl}`); // Ensure base64 content has line breaks
            rawEmail += nl;
        });
    }

    // --- Final Boundary --- 
    rawEmail += `--${boundary}--${nl}`;

    return rawEmail;
}

// --- Utility Functions for Processing Emails ---

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

// Helper function to extract plain text from email body
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

// Helper function to extract attachment information
function getAttachmentInfo(payload: any): { filename: string; mime_type: string; attachmentId: string; size: number }[] {
    const attachments: { filename: string; mime_type: string; attachmentId: string; size: number }[] = [];
    if (!payload) return attachments;
    
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
                mime_type: currentPart.mimeType || 'application/octet-stream',
                attachmentId: currentPart.body.attachmentId,
                size: currentPart.body.size || 0
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
           mime_type: payload.mimeType || 'application/octet-stream',
           attachmentId: payload.body.attachmentId,
           size: payload.body.size || 0
       });
    }
    // Search within parts
    parts.forEach(findAttachmentsRecursive);

    return attachments;
}

// --- Gmail API Endpoints ---

// 1. List Labels
router.get('/labels', async (req: Request, res: Response) => {
    console.log("GET /labels");
    const accessToken = extractToken(req);
    if (!accessToken) {
        return res.status(401).json({ error: 'Missing or invalid Bearer token' });
    }

    try {
        const gmail = getGmailClient(accessToken);
        const response = await gmail.users.labels.list({ userId: 'me' });
        res.json(response.data);
    } catch (error) {
        handleGmailApiError(error, res);
    }
});

// 2. List Messages (with query params)
router.get('/messages', async (req: Request, res: Response) => {
    console.log(`---> Received request: ${req.method} ${req.originalUrl}`); // Log full incoming path
    console.log("Query Params:", req.query);

    // 1. Extract the Google OAuth Access Token from the Authorization header
    //    (e.g., 'Bearer <token>')
    const accessToken = extractToken(req); // Replace with your actual token extraction logic
    if (!accessToken) {
        // If no token, return 401 Unauthorized
        return res.status(401).json({ error: 'Missing or invalid Bearer token' });
    }

    try {
        // 2. Initialize the Gmail API client with the user's access token
        const gmail = getGmailClient(accessToken); // Replace with your Gmail client initialization

        // 3. Prepare parameters for the Gmail API call from request query params
        const { labelIds, q, pageToken, maxResults, includeSpamTrash } = req.query;
        const params: any = { userId: 'me' }; // Use 'me' for the authenticated user

        // Handle query parameters, converting types as needed
        if (labelIds && typeof labelIds === 'string') {
            // Split comma-separated string from frontend back into an array for the API
            params.labelIds = labelIds.split(',');
        }
        if (q && typeof q === 'string') params.q = q;
        if (pageToken && typeof pageToken === 'string') params.pageToken = pageToken;
        if (maxResults && !isNaN(Number(maxResults))) params.maxResults = Number(maxResults);
        if (includeSpamTrash === 'true') params.includeSpamTrash = true;

        console.log("Calling gmail.users.messages.list with params:", params);

        // 4. Call the Google Gmail API
        const response = await gmail.users.messages.list(params);

        // 5. Send the response data back to the client
        res.json(response.data);

    } catch (error) {
        // 6. Handle potential errors (e.g., invalid token, API errors)
        console.error(`Error in GET /messages:`, error);
        handleGmailApiError(error, res); // Replace with your error handling logic
    }
});

// --- Helper function placeholders (implement these based on your backend structure) ---

function extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7); // Get token part after 'Bearer '
    }
    return null;
}

function getGmailClient(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    return google.gmail({ version: 'v1', auth: oauth2Client });
}

function handleGmailApiError(error: any, res: Response) {
    // Basic error handling - check for Google API error structure
    if (error.response && error.response.data && error.response.data.error) {
        const googleError = error.response.data.error;
        res.status(googleError.code || 500).json({
            error: 'Google API Error',
            message: googleError.message || 'An error occurred with the Google API.',
            details: googleError.errors
        });
    } else if (error.message?.includes('invalid_grant') || error.message?.includes('Token has been expired or revoked')) {
         res.status(401).json({ error: 'Invalid credentials', message: 'Access token may be expired or invalid.' });
    }
    else {
        res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unknown error occurred.' });
    }
}



// 3. Get Message Details
router.get('/messages/:messageId', async (req: Request, res: Response) => {
    const { messageId } = req.params;
    console.log(`---> Received request: ${req.method} ${req.originalUrl}`); // Log full incoming path
    console.log(`Params:`, req.params);
    const accessToken = extractToken(req);
    if (!accessToken) {
        return res.status(401).json({ error: 'Missing or invalid Bearer token' });
    }
    if (!messageId) {
        return res.status(400).json({ error: 'Missing messageId parameter' });
    }

    try {
        const gmail = getGmailClient(accessToken);
        const format = req.query.format && typeof req.query.format === 'string' ? req.query.format : 'full'; // Allow format override (full, metadata, raw, minimal)

        const response = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: format as any // Cast as googleapis types can be strict
        });
        res.json(response.data);
    } catch (error) {
        handleGmailApiError(error, res);
    }
});

// 4. Send Message (Refactored)
router.post('/messages/send', async (req: Request, res: Response) => {
    console.log("POST /messages/send (structured)");

    // --- NEW LOGS --- 
    console.log("--> Request Content-Type Header:", req.headers['content-type']);
    console.log("--> req.body exists?", req.body ? 'Yes' : 'No', "Type:", typeof req.body);
    // --- END NEW LOGS --- 

    const accessToken = extractToken(req);
    const { to, cc, bcc, subject, body, attachments, from } = req.body; // Expect structured data
    
    // Log the received request body for debugging (keep this too for now)
    console.log("Received Body for /messages/send:", req.body ? JSON.stringify(req.body, null, 2) : 'req.body is missing or undefined');

    // --- Add detailed validation logging --- 
    console.log("--> Starting validation...");

    // IMPORTANT: You NEED the sender's 'from' email address...
    const senderEmail = from || 'me@example.com'; 
    console.log(`--> Validating senderEmail (derived from 'from'): ${senderEmail}`);

    if (!accessToken) {
        console.log("--> FAILED validation: accessToken missing");
        return res.status(401).json({ error: 'Missing or invalid Bearer token' });
    }
    console.log("--> PASSED validation: accessToken present");

    console.log(`--> Validating 'to' field: ${JSON.stringify(to)}`);
    if (!to || (Array.isArray(to) && to.length === 0) || (typeof to !== 'string' && !Array.isArray(to))) {
        console.log("--> FAILED validation: 'to' field missing or invalid");
        return res.status(400).json({ error: 'Missing or invalid \'to\' recipient(s)' });
    }
    console.log("--> PASSED validation: 'to' field");

    console.log(`--> Validating 'subject' field: ${subject}`);
    if (!subject || typeof subject !== 'string') {
        console.log("--> FAILED validation: 'subject' field missing or invalid");
        return res.status(400).json({ error: 'Missing or invalid \'subject\'' });
    }
    console.log("--> PASSED validation: 'subject' field");

    console.log(`--> Validating 'body' field type: ${typeof body}`);
    if (typeof body !== 'string') { 
        console.log("--> FAILED validation: 'body' field missing or not a string");
        return res.status(400).json({ error: 'Missing or invalid \'body\'' });
    }
    console.log("--> PASSED validation: 'body' field");

    console.log(`--> Validating derived 'senderEmail': ${senderEmail}`);
    if (!senderEmail || typeof senderEmail !== 'string' || senderEmail === 'me@example.com') { // Also check if it used the placeholder
         console.log("--> FAILED validation: 'senderEmail' missing or invalid (was placeholder used?)");
         // Note: Allow placeholder for now, but log warning
         if (senderEmail === 'me@example.com') {
             console.warn("Warning: Using placeholder 'me@example.com' as sender. Ensure 'from' field is sent in request body.")
         } else {
            return res.status(400).json({ error: 'Sender \'from\' email is required and must be a string' }); 
         }
    }
    console.log("--> PASSED validation: 'senderEmail' field");

    // Validate attachments format if present
    console.log(`--> Validating 'attachments' field: ${JSON.stringify(attachments)}`);
    if (attachments && !Array.isArray(attachments)) {
        console.log("--> FAILED validation: 'attachments' field present but not an array");
        return res.status(400).json({ error: '\'attachments\' must be an array' });
    }
    console.log("--> PASSED validation: 'attachments' is array or null/undefined");

    if (attachments) {
        console.log("--> Validating individual attachments...");
        for (const [index, att] of attachments.entries()) {
            console.log(`--> Validating attachment #${index + 1}`);
            if (!att || typeof att !== 'object') {
                console.log(`--> FAILED validation: Attachment #${index + 1} is not an object.`);
                return res.status(400).json({ error: `Invalid attachment format at index ${index}. Expected object.` });
            }
            if (!att.filename || typeof att.filename !== 'string' || 
                !att.mimeType || typeof att.mimeType !== 'string' ||
                !att.content || typeof att.content !== 'string') {
                 console.log(`--> FAILED validation: Attachment #${index + 1} missing required properties (filename, mimeType, content as strings).`);
                return res.status(400).json({ error: `Invalid attachment format at index ${index}. Each attachment needs filename, mimeType, and content (base64 string).` });
            }
             console.log(`--> PASSED validation: Attachment #${index + 1}`);
        }
        console.log("--> PASSED validation: All individual attachments");
    }
    
    console.log("--> ALL VALIDATIONS PASSED. Proceeding to build/send email.");
    // --- End detailed validation logging ---

    try {
        const gmail = getGmailClient(accessToken);

        // Build the raw email string on the backend
        const rawEmailString = buildRawEmail(to, senderEmail, subject, body, attachments, cc, bcc);

        // Base64URL encode the entire raw string for the Gmail API
        const base64UrlEncodedEmail = Buffer.from(rawEmailString)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, ''); // Remove padding

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: base64UrlEncodedEmail
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error building or sending email:", error);
        handleGmailApiError(error, res);
    }
});

// 5. Modify Message Labels
router.post('/messages/:messageId/modify', async (req: Request, res: Response) => {
    const { messageId } = req.params;
    console.log(`POST /messages/${messageId}/modify`);
    const accessToken = extractToken(req);
    const { addLabelIds, removeLabelIds } = req.body; // Expect arrays of label IDs

    if (!accessToken) {
        return res.status(401).json({ error: 'Missing or invalid Bearer token' });
    }
    if (!messageId) {
        return res.status(400).json({ error: 'Missing messageId parameter' });
    }
    if (!addLabelIds && !removeLabelIds) {
        return res.status(400).json({ error: 'Request must include addLabelIds or removeLabelIds' });
    }
    // Basic validation that they are arrays if they exist
    if (addLabelIds && !Array.isArray(addLabelIds)) {
         return res.status(400).json({ error: 'addLabelIds must be an array' });
    }
     if (removeLabelIds && !Array.isArray(removeLabelIds)) {
         return res.status(400).json({ error: 'removeLabelIds must be an array' });
    }

    try {
        const gmail = getGmailClient(accessToken);
        const response = await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                addLabelIds: addLabelIds || [],
                removeLabelIds: removeLabelIds || []
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        handleGmailApiError(error, res);
    }
});

// 6. Trash Message
router.post('/messages/:messageId/trash', async (req: Request, res: Response) => {
    const { messageId } = req.params;
    console.log(`POST /messages/${messageId}/trash`);
    const accessToken = extractToken(req);

    if (!accessToken) {
        return res.status(401).json({ error: 'Missing or invalid Bearer token' });
    }
    if (!messageId) {
        return res.status(400).json({ error: 'Missing messageId parameter' });
    }

    try {
        const gmail = getGmailClient(accessToken);
        const response = await gmail.users.messages.trash({ userId: 'me', id: messageId });
        // Trash API returns minimal response on success (often just id), status 200 is enough
        res.status(200).json(response.data);
    } catch (error) {
        handleGmailApiError(error, res);
    }
});

// 7. Untrash Message (Counterpart to Trash)
router.post('/messages/:messageId/untrash', async (req: Request, res: Response) => {
    const { messageId } = req.params;
    console.log(`POST /messages/${messageId}/untrash`);
    const accessToken = extractToken(req);

    if (!accessToken) {
        return res.status(401).json({ error: 'Missing or invalid Bearer token' });
    }
    if (!messageId) {
        return res.status(400).json({ error: 'Missing messageId parameter' });
    }

    try {
        const gmail = getGmailClient(accessToken);
        const response = await gmail.users.messages.untrash({ userId: 'me', id: messageId });
        res.status(200).json(response.data);
    } catch (error) {
        handleGmailApiError(error, res);
    }
});

// 8. Get Attachment
router.get('/messages/:messageId/attachments/:attachmentId', async (req: Request, res: Response) => {
    const { messageId, attachmentId } = req.params;
    console.log(`GET /messages/${messageId}/attachments/${attachmentId}`);
    const accessToken = extractToken(req);

    if (!accessToken) {
        return res.status(401).json({ error: 'Missing or invalid Bearer token' });
    }
    if (!messageId || !attachmentId) {
        return res.status(400).json({ error: 'Missing messageId or attachmentId parameter' });
    }

    try {
        const gmail = getGmailClient(accessToken);
        const response = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId: messageId,
            id: attachmentId
        });
        res.json(response.data); // Contains { size, data (base64url) }
    } catch (error) {
        handleGmailApiError(error, res);
    }
});

// 9. Snooze Message (Corrected Implementation using Modify)
router.post('/messages/:messageId/snooze', async (req: Request, res: Response) => {
    const { messageId } = req.params;
    console.log(`POST /messages/${messageId}/snooze`);
    const accessToken = extractToken(req);
    const { snoozeUntil } = req.body;

    if (!accessToken) {
        return res.status(401).json({ error: 'Missing or invalid Bearer token' });
    }
    if (!messageId) {
        return res.status(400).json({ error: 'Missing messageId parameter' });
    }
    if (!snoozeUntil) {
        return res.status(400).json({ error: 'Missing snoozeUntil timestamp in request body' });
    }
    
    let snoozeTimeMs: number;
    if (typeof snoozeUntil === 'number') {
        snoozeTimeMs = snoozeUntil;
    } else if (typeof snoozeUntil === 'string') {
        try {
            snoozeTimeMs = new Date(snoozeUntil).getTime();
            if (isNaN(snoozeTimeMs)) throw new Error('Invalid date string');
        } catch (dateError) {
            return res.status(400).json({ error: 'Invalid snoozeUntil date format. Use RFC 3339 string or milliseconds since epoch.' });
        }
    } else {
         return res.status(400).json({ error: 'Invalid snoozeUntil type. Use RFC 3339 string or milliseconds since epoch.' });
    }

    try {
        const gmail = getGmailClient(accessToken);

        // Cast requestBody to 'any' to bypass strict type checking for snoozeUntilTimestampMs
        const requestBody: any = {
            removeLabelIds: ['INBOX'],
            snoozeUntilTimestampMs: snoozeTimeMs.toString() // API expects string
        };

        const response = await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: requestBody
        });
        
        // Assuming response structure is consistent, access data
        res.status(200).json(response.data);

    } catch (error) {
        handleGmailApiError(error, res);
    }
});

// 10. Batch Messages Fetch with Google Batch API
router.post('/messages/batch', async (req: Request, res: Response) => {
    console.log(`POST /messages/batch`);
    const accessToken = extractToken(req);
    const { ids } = req.body;

    if (!accessToken) {
        return res.status(401).json({ error: 'Missing or invalid token' });
    }
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Request must include an array of message IDs' });
    }

    // Limit the number of messages that can be fetched at once
    const MAX_BATCH_SIZE = 50;
    if (ids.length > MAX_BATCH_SIZE) {
        return res.status(400).json({ 
            error: `Batch size exceeds maximum allowed (${MAX_BATCH_SIZE})`,
            message: `Please limit your request to ${MAX_BATCH_SIZE} messages per batch`
        });
    }

    try {
        const gmail = getGmailClient(accessToken);
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        
        // We'll process messages in smaller batches to avoid hitting limitations
        const BATCH_CHUNK_SIZE = 10;
        let allMessages: any[] = [];
        
        // Process messages in chunks
        for (let i = 0; i < ids.length; i += BATCH_CHUNK_SIZE) {
            const chunkIds = ids.slice(i, i + BATCH_CHUNK_SIZE);
            console.log(`Processing batch chunk ${i/BATCH_CHUNK_SIZE + 1} with ${chunkIds.length} messages`);
            
            // Process all messages in this chunk
            const messagePromises = chunkIds.map(async (messageId) => {
                try {
                    const response = await gmail.users.messages.get({
                        userId: 'me',
                        id: messageId,
                        format: 'full'
                    });
                    
                    // Extract and process message data
                    const messageData = response.data;
                    const headers = messageData.payload?.headers || [];
                    
                    // Extract common headers
                    const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
                    const from = headers.find(h => h.name === 'From')?.value || '';
                    const to = headers.find(h => h.name === 'To')?.value || '';
                    const cc = headers.find(h => h.name === 'Cc')?.value || '';
                    const date = headers.find(h => h.name === 'Date')?.value || '';
                    
                    // Process raw email body
                    const body = getPlainTextBody(messageData.payload) || messageData.snippet || '';
                    
                    // Check if message is unread
                    const isUnread = messageData.labelIds?.includes('UNREAD') || false;
                    
                    // Extract attachment information
                    const attachments = getAttachmentInfo(messageData.payload);
                    
                    return {
                        id: messageData.id,
                        threadId: messageData.threadId,
                        snippet: messageData.snippet,
                        subject,
                        from,
                        to,
                        cc,
                        date: new Date(date).toISOString(),
                        body,
                        isUnread,
                        attachments,
                        labelIds: messageData.labelIds || [],
                        sizeEstimate: messageData.sizeEstimate,
                        internalDate: messageData.internalDate
                    };
                } catch (error: any) {
                    console.error(`Error fetching message ${messageId}:`, error);
                    // Return error object for this specific message
                    return {
                        id: messageId,
                        error: true,
                        errorMessage: error.message || 'Failed to fetch message',
                        errorCode: error.code || 500
                    };
                }
            });
            
            // Wait for all messages in this chunk to be processed
            const chunkResults = await Promise.all(messagePromises);
            allMessages = [...allMessages, ...chunkResults];
            
            // Add a small delay between chunks to avoid rate limiting
            if (i + BATCH_CHUNK_SIZE < ids.length) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        
        // Set cache headers (5 minutes)
        res.setHeader('Cache-Control', 'private, max-age=300');
        res.setHeader('ETag', `W/"messages-${new Date().getTime()}"`);
        
        // Return the processed messages
        res.status(200).json({
            messages: allMessages,
            totalMessages: allMessages.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error in batch messages endpoint:", error);
        handleGmailApiError(error, res);
    }
});

export default router;