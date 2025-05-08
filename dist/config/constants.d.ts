export declare const COHERE_API_KEY: string | undefined;
export declare const MAX_BODY_CHARS = 8000;
export declare const COHERE_TIMEOUT = 180000;
export declare const COHERE_MAX_RETRIES = 3;
export declare const MAX_EMAIL_LENGTH = 2000;
export declare const ALLOWED_CATEGORIES: readonly ["Direct Request/Question", "Information/Update", "Meeting/Appointment", "Offer/Opportunity", "Promotion/Marketing", "Social/Personal", "Application/Interview", "Notification/Alert", "Invoice/Billing", "Feedback/Survey", "Other"];
export declare const ALLOWED_INTENT_TYPES: readonly ["create_task", "draft_reply_email", "schedule_event", "open_link", "review_document", "archive_email", "unknown"];
export declare const DEFAULT_LABEL_NAMES: readonly ["Follow-up", "Work", "Finance", "Health", "Events", "Promotions", "Social"];
export declare const DEFAULT_DAYS = 3;
export declare const MAX_ALLOWED_COUNT = 100;
export declare const MAX_ALLOWED_DAYS = 90;
export declare const DEFAULT_MAX_RESULTS_FOR_DAYS = 50;
export declare const EMAIL_PROCESSING: {
    readonly MAX_SUBJECT_LENGTH: 200;
    readonly MAX_BODY_LENGTH: 5000;
    readonly MAX_ATTACHMENTS: 10;
    readonly SUPPORTED_MIME_TYPES: readonly ["text/plain", "text/html", "application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
};
export declare const COHERE_SETTINGS: {
    readonly DEFAULT_TEMPERATURE: 0.7;
    readonly MAX_TOKENS: 1000;
    readonly TOP_K: 0;
    readonly TOP_P: 0.9;
    readonly FREQUENCY_PENALTY: 0;
    readonly PRESENCE_PENALTY: 0;
};
export declare const ERROR_MESSAGES: {
    readonly INVALID_CATEGORIES: "Invalid categories. Please provide a non-empty array of categories.";
    readonly MISSING_ACCESS_TOKEN: "Missing accessToken in request body";
    readonly INVALID_DAYS: "Invalid days parameter. Please provide a number between 1 and 30.";
    readonly INVALID_COUNT: "Invalid count parameter. Please provide a number between 1 and 100.";
    readonly INVALID_SENDER: "Invalid sender parameter. Please provide a valid email address.";
    readonly INVALID_DATE_RANGE: "Invalid date range. Please provide valid start and end dates.";
    readonly INVALID_QUERY: "Invalid query parameter. Please provide a valid search query.";
    readonly GMAIL_API_ERROR: "Error calling Gmail API";
    readonly DAYS_EXCEEDED: "Days parameter exceeds maximum allowed value.";
    readonly INTERNAL_SERVER_ERROR: "An internal server error occurred. Please try again later.";
};
