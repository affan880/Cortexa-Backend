import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { Buffer } from 'buffer';
import { CohereClient } from 'cohere-ai';
import { 
  COHERE_API_KEY, 
  COHERE_TIMEOUT, 
  COHERE_MAX_RETRIES,
  MAX_EMAIL_LENGTH,
  COHERE_SETTINGS,
  ERROR_MESSAGES
} from '../config/constants';
import { EmailData, EmailContent, Attachment, CohereResponse, CohereGenerateRequest } from '../types/email';

// Initialize Cohere
const cohere = new CohereClient({
  token: COHERE_API_KEY
});

// Helper function to decode base64url
export const base64UrlDecode = (str: string): string => {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
};

// Helper function to find the plain text body part
export const getPlainTextBody = (payload: any): string => {
  if (!payload.parts) {
    return payload.body.data ? base64UrlDecode(payload.body.data) : '';
  }

  const textPart = payload.parts.find((part: any) => part.mimeType === 'text/plain');
  if (textPart && textPart.body.data) {
    return base64UrlDecode(textPart.body.data);
  }

  const htmlPart = payload.parts.find((part: any) => part.mimeType === 'text/html');
  if (htmlPart && htmlPart.body.data) {
    // Basic HTML to text conversion - you might want to use a proper HTML parser
    return base64UrlDecode(htmlPart.body.data)
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return '';
};

// Helper function to get attachment info
export const getAttachmentInfo = (payload: any): Attachment[] => {
  if (!payload.parts) return [];

  const attachments: Attachment[] = [];
  
  const processPart = (part: any) => {
    if (part.filename && part.filename.length > 0) {
      attachments.push({
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body.size || 0,
        attachmentId: part.body.attachmentId
      });
    }
    if (part.parts) {
      part.parts.forEach(processPart);
    }
  };

  payload.parts.forEach(processPart);
  return attachments;
};

// Helper function to call Cohere with timeout
export const callCohereWithTimeout = async (prompt: string, temperature = 0.7): Promise<CohereResponse> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= COHERE_MAX_RETRIES; attempt++) {
    try {
      const request: CohereGenerateRequest = {
        prompt,
        maxTokens: 1000,
        temperature,
        k: 0,
        stopSequences: [],
        returnLikelihoods: "NONE"
      };

      const response = await cohere.generate(request as any);

      if (!response.generations?.[0]?.text) {
        throw new Error('No response from Cohere API');
      }

      return {
        content: response.generations[0].text,
        response: response.generations[0].text,
        metadata: {
          apiVersion: response.meta?.apiVersion,
          warnings: response.meta?.warnings
        }
      };
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < COHERE_MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed to get response from Cohere after multiple attempts');
};

// Helper function to create Gmail client
export const createGmailClient = (accessToken: string) => {
  const oauth2Client = new OAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
};

// Helper function to process email data
export const processEmailData = (message: any): EmailData => {
  if (!message || !message.payload) {
    return {
      messageId: message?.id || '',
      threadId: message?.threadId || '',
      subject: '',
      from: '',
      to: [],
      date: '',
      snippet: message?.snippet || '',
      body: '',
      labelIds: message?.labelIds || [],
      attachments: []
    };
  }

  const payload = message.payload;
  const headers = payload.headers || [];
  
  const getHeader = (name: string): string => {
    const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : '';
  };

  const toHeader = getHeader('to');
  const toArray = toHeader ? toHeader.split(',').map((email: string) => email.trim()) : [];

  return {
    messageId: message.id,
    threadId: message.threadId,
    subject: getHeader('subject'),
    from: getHeader('from'),
    to: toArray,
    date: getHeader('date'),
    snippet: message.snippet,
    body: getPlainTextBody(payload),
    labelIds: message.labelIds,
    attachments: getAttachmentInfo(payload)
  };
}; 