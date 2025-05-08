import { ALLOWED_CATEGORIES, ALLOWED_INTENT_TYPES } from '../config/constants';
export type Category = typeof ALLOWED_CATEGORIES[number];
export type IntentType = typeof ALLOWED_INTENT_TYPES[number];
export interface Attachment {
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
}
export interface EmailContent {
    subject: string;
    body: string;
    timestamp?: string;
    messageId?: string;
    threadId?: string;
    from?: string;
    to?: string[];
    cc?: string[];
    bcc?: string[];
    attachments?: Array<{
        filename: string;
        mimeType: string;
    }>;
}
export interface EmailSummaryResponse {
    summary: string;
    keyPoints: string[];
    suggestedActions: string[];
    followUpNeeded: boolean;
    priority: 'high' | 'medium' | 'low';
}
export interface EmailData extends EmailContent {
    error?: string;
    labelIds?: string[];
    snippet?: string;
    date?: string;
}
export interface CategorizedEmails {
    [category: string]: EmailData[];
}
export interface EmailAnalysisResponse {
    categorizedEmails: CategorizedEmails;
    totalEmails: number;
    categories: string[];
    analysisDate: string;
}
export interface EmailGenerationRequest {
    accessToken: string;
    emailBody: string;
    intent: IntentType;
    context?: {
        previousEmails?: EmailData[];
        userPreferences?: Record<string, any>;
    };
}
export interface EmailGenerationResponse {
    generatedContent: string;
    suggestedActions: string[];
    confidence: number;
    metadata: {
        model: string;
        timestamp: string;
        processingTime: number;
    };
}
export interface CohereResponse {
    content: string;
    response?: string;
    metadata?: {
        apiVersion?: {
            version: string;
        };
        warnings?: string[];
    };
}
export interface CohereGenerateRequest {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
    k?: number;
    stopSequences?: string[];
    returnLikelihoods?: "GENERATION" | "ALL" | "NONE";
}
