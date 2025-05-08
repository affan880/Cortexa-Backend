export const COHERE_API_KEY = process.env.COHERE_API_KEY;
export const MAX_BODY_CHARS = 8000;
export const COHERE_TIMEOUT = 180000;
export const COHERE_MAX_RETRIES = 3;
export const MAX_EMAIL_LENGTH = 2000;

export const ALLOWED_CATEGORIES = [
  "Direct Request/Question",
  "Information/Update",
  "Meeting/Appointment",
  "Offer/Opportunity",
  "Promotion/Marketing",
  "Social/Personal",
  "Application/Interview",
  "Notification/Alert",
  "Invoice/Billing",
  "Feedback/Survey",
  "Other"
] as const;

export const ALLOWED_INTENT_TYPES = [
  "create_task",
  "draft_reply_email",
  "schedule_event",
  "open_link",
  "review_document",
  "archive_email",
  "unknown"
] as const;

export const DEFAULT_LABEL_NAMES = [
  "Follow-up",
  "Work",
  "Finance",
  "Health",
  "Events",
  "Promotions",
  "Social"
] as const;

export const DEFAULT_DAYS = 3;
export const MAX_ALLOWED_COUNT = 100;
export const MAX_ALLOWED_DAYS = 90;
export const DEFAULT_MAX_RESULTS_FOR_DAYS = 50;

export const EMAIL_PROCESSING = {
  MAX_SUBJECT_LENGTH: 200,
  MAX_BODY_LENGTH: 5000,
  MAX_ATTACHMENTS: 10,
  SUPPORTED_MIME_TYPES: [
    'text/plain',
    'text/html',
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
} as const;

export const COHERE_SETTINGS = {
  DEFAULT_TEMPERATURE: 0.7,
  MAX_TOKENS: 1000,
  TOP_K: 0,
  TOP_P: 0.9,
  FREQUENCY_PENALTY: 0,
  PRESENCE_PENALTY: 0
} as const;

export const ERROR_MESSAGES = {
  INVALID_CATEGORIES: "Invalid categories. Please provide a non-empty array of categories.",
  MISSING_ACCESS_TOKEN: "Missing accessToken in request body",
  INVALID_DAYS: "Invalid days parameter. Please provide a number between 1 and 30.",
  INVALID_COUNT: "Invalid count parameter. Please provide a number between 1 and 100.",
  INVALID_SENDER: "Invalid sender parameter. Please provide a valid email address.",
  INVALID_DATE_RANGE: "Invalid date range. Please provide valid start and end dates.",
  INVALID_QUERY: "Invalid query parameter. Please provide a valid search query.",
  GMAIL_API_ERROR: "Error calling Gmail API",
  DAYS_EXCEEDED: "Days parameter exceeds maximum allowed value.",
  INTERNAL_SERVER_ERROR: "An internal server error occurred. Please try again later."
} as const; 