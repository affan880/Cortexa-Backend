"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
exports.config = {
    // Server Configuration
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    // API Keys
    COHERE_API_KEY: process.env.COHERE_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,
    // Email Processing
    MAX_EMAIL_LENGTH: 2000,
    MAX_BODY_CHARS: 8000,
    COHERE_TIMEOUT: 180000,
    COHERE_MAX_RETRIES: 3,
    // Default Values
    DEFAULT_DAYS: 3,
    MAX_ALLOWED_COUNT: 100,
    MAX_ALLOWED_DAYS: 90,
    DEFAULT_MAX_RESULTS_FOR_DAYS: 50,
    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
// Validate required environment variables
const requiredEnvVars = [
    'COHERE_API_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI'
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
//# sourceMappingURL=env.js.map