"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEmailData = exports.createGmailClient = exports.callCohereWithTimeout = exports.getAttachmentInfo = exports.getPlainTextBody = exports.base64UrlDecode = void 0;
const googleapis_1 = require("googleapis");
const google_auth_library_1 = require("google-auth-library");
const buffer_1 = require("buffer");
const cohere_ai_1 = require("cohere-ai");
const constants_1 = require("../config/constants");
// Initialize Cohere
const cohere = new cohere_ai_1.CohereClient({
    token: constants_1.COHERE_API_KEY
});
// Helper function to decode base64url
const base64UrlDecode = (str) => {
    return buffer_1.Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
};
exports.base64UrlDecode = base64UrlDecode;
// Helper function to find the plain text body part
const getPlainTextBody = (payload) => {
    if (!payload.parts) {
        return payload.body.data ? (0, exports.base64UrlDecode)(payload.body.data) : '';
    }
    const textPart = payload.parts.find((part) => part.mimeType === 'text/plain');
    if (textPart && textPart.body.data) {
        return (0, exports.base64UrlDecode)(textPart.body.data);
    }
    const htmlPart = payload.parts.find((part) => part.mimeType === 'text/html');
    if (htmlPart && htmlPart.body.data) {
        // Basic HTML to text conversion - you might want to use a proper HTML parser
        return (0, exports.base64UrlDecode)(htmlPart.body.data)
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
    return '';
};
exports.getPlainTextBody = getPlainTextBody;
// Helper function to get attachment info
const getAttachmentInfo = (payload) => {
    if (!payload.parts)
        return [];
    const attachments = [];
    const processPart = (part) => {
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
exports.getAttachmentInfo = getAttachmentInfo;
// Helper function to call Cohere with timeout
const callCohereWithTimeout = async (prompt, temperature = 0.7) => {
    let lastError = null;
    for (let attempt = 1; attempt <= constants_1.COHERE_MAX_RETRIES; attempt++) {
        try {
            const request = {
                prompt,
                maxTokens: 1000,
                temperature,
                k: 0,
                stopSequences: [],
                returnLikelihoods: "NONE"
            };
            const response = await cohere.generate(request);
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
        }
        catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt} failed:`, error);
            if (attempt < constants_1.COHERE_MAX_RETRIES) {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError || new Error('Failed to get response from Cohere after multiple attempts');
};
exports.callCohereWithTimeout = callCohereWithTimeout;
// Helper function to create Gmail client
const createGmailClient = (accessToken) => {
    const oauth2Client = new google_auth_library_1.OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    return googleapis_1.google.gmail({ version: 'v1', auth: oauth2Client });
};
exports.createGmailClient = createGmailClient;
// Helper function to process email data
const processEmailData = (message) => {
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
    const getHeader = (name) => {
        const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : '';
    };
    const toHeader = getHeader('to');
    const toArray = toHeader ? toHeader.split(',').map((email) => email.trim()) : [];
    return {
        messageId: message.id,
        threadId: message.threadId,
        subject: getHeader('subject'),
        from: getHeader('from'),
        to: toArray,
        date: getHeader('date'),
        snippet: message.snippet,
        body: (0, exports.getPlainTextBody)(payload),
        labelIds: message.labelIds,
        attachments: (0, exports.getAttachmentInfo)(payload)
    };
};
exports.processEmailData = processEmailData;
//# sourceMappingURL=emailService.js.map