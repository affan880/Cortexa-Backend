import { EmailData, Attachment, CohereResponse } from '../types/email';
export declare const base64UrlDecode: (str: string) => string;
export declare const getPlainTextBody: (payload: any) => string;
export declare const getAttachmentInfo: (payload: any) => Attachment[];
export declare const callCohereWithTimeout: (prompt: string, temperature?: number) => Promise<CohereResponse>;
export declare const createGmailClient: (accessToken: string) => import("googleapis").gmail_v1.Gmail;
export declare const processEmailData: (message: any) => EmailData;
