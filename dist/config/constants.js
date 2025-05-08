"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.COHERE_SETTINGS = exports.EMAIL_PROCESSING = exports.DEFAULT_MAX_RESULTS_FOR_DAYS = exports.MAX_ALLOWED_DAYS = exports.MAX_ALLOWED_COUNT = exports.DEFAULT_DAYS = exports.DEFAULT_LABEL_NAMES = exports.ALLOWED_INTENT_TYPES = exports.ALLOWED_CATEGORIES = exports.MAX_EMAIL_LENGTH = exports.COHERE_MAX_RETRIES = exports.COHERE_TIMEOUT = exports.MAX_BODY_CHARS = exports.COHERE_API_KEY = void 0;
exports.COHERE_API_KEY = process.env.COHERE_API_KEY;
exports.MAX_BODY_CHARS = 8000;
exports.COHERE_TIMEOUT = 180000;
exports.COHERE_MAX_RETRIES = 3;
exports.MAX_EMAIL_LENGTH = 2000;
exports.ALLOWED_CATEGORIES = [
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
];
exports.ALLOWED_INTENT_TYPES = [
    "create_task",
    "draft_reply_email",
    "schedule_event",
    "open_link",
    "review_document",
    "archive_email",
    "unknown"
];
exports.DEFAULT_LABEL_NAMES = [
    "Follow-up",
    "Work",
    "Finance",
    "Health",
    "Events",
    "Promotions",
    "Social"
];
exports.DEFAULT_DAYS = 3;
exports.MAX_ALLOWED_COUNT = 100;
exports.MAX_ALLOWED_DAYS = 90;
exports.DEFAULT_MAX_RESULTS_FOR_DAYS = 50;
exports.EMAIL_PROCESSING = {
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
};
exports.COHERE_SETTINGS = {
    DEFAULT_TEMPERATURE: 0.7,
    MAX_TOKENS: 1000,
    TOP_K: 0,
    TOP_P: 0.9,
    FREQUENCY_PENALTY: 0,
    PRESENCE_PENALTY: 0
};
exports.ERROR_MESSAGES = {
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
};
//# sourceMappingURL=constants.js.map