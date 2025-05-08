"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Main application entry point
 */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const api_1 = __importDefault(require("./routes/api"));
const gmail_1 = __importDefault(require("./routes/gmail"));
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080; // Railway uses 8080 by default
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
const admin = require('./firebaseConfig');
// Array to store log entries (simple in-memory store)
const requestLogs = [];
const MAX_LOG_ENTRIES = 100; // Limit the number of logs stored in memory
// Array to store detailed log entries with request and response data
const detailedLogs = [];
const MAX_DETAILED_LOGS = 50; // Limit detailed logs to avoid memory issues
const requestLoggerMiddleware = (req, res, next) => {
    // Skip logging /logs requests to avoid cluttering logs
    if (req.path === '/logs' || req.path === '/detailed-logs') {
        return next();
    }
    const logEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        ip: req.ip // Get the request IP address
    };
    // Add log entry to the beginning of the array
    requestLogs.unshift(logEntry);
    // Keep the log array size limited
    if (requestLogs.length > MAX_LOG_ENTRIES) {
        requestLogs.pop(); // Remove the oldest entry
    }
    console.log(`[Request Log] ${logEntry.timestamp} - ${logEntry.method} ${logEntry.url} from ${logEntry.ip}`); // Also log to console
    next(); // Pass control to the next middleware/route handler
};
// Middleware to capture detailed request and response data
const detailedLoggerMiddleware = (req, res, next) => {
    // Skip logging /logs requests to avoid cluttering logs
    if (req.path === '/logs' || req.path === '/detailed-logs') {
        return next();
    }
    const startTime = Date.now();
    const logId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    // Capture request data
    const requestData = {
        id: logId,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        requestHeaders: { ...req.headers },
        requestBody: { ...req.body }
    };
    // Remove sensitive information from logs
    if (requestData.requestHeaders.authorization) {
        requestData.requestHeaders.authorization = '[REDACTED]';
    }
    if (requestData.requestBody.accessToken) {
        requestData.requestBody.accessToken = '[REDACTED]';
    }
    // Capture the original methods
    const originalEnd = res.end;
    const originalWrite = res.write;
    const chunks = [];
    // Override write
    res.write = function (chunk, encoding, callback) {
        if (Buffer.isBuffer(chunk)) {
            chunks.push(chunk);
        }
        else if (typeof chunk === 'string') {
            chunks.push(Buffer.from(chunk));
        }
        return originalWrite.call(res, chunk, encoding, callback);
    };
    // Override end
    res.end = function (chunk, encoding, callback) {
        if (chunk) {
            if (Buffer.isBuffer(chunk)) {
                chunks.push(chunk);
            }
            else if (typeof chunk === 'string') {
                chunks.push(Buffer.from(chunk));
            }
        }
        const responseTime = Date.now() - startTime;
        const responseSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        // Create detailed log entry
        const detailedLogEntry = {
            ...requestData,
            responseStatus: res.statusCode,
            responseTime, // in milliseconds
            responseHeaders: res.getHeaders(),
            responseSize // in bytes
        };
        // Add to detailed logs
        detailedLogs.unshift(detailedLogEntry);
        // Keep the detailed logs array limited
        if (detailedLogs.length > MAX_DETAILED_LOGS) {
            detailedLogs.pop();
        }
        return originalEnd.call(res, chunk, encoding, callback);
    };
    next();
};
// Register the middleware to run for ALL incoming requests
app.use(requestLoggerMiddleware);
app.use(detailedLoggerMiddleware);
// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'TaskBox API is running' });
});
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Logs endpoint - Access to all logged requests
app.get('/logs', (req, res) => {
    // Return the stored logs as JSON
    // Return a copy to prevent accidental modification
    res.status(200).json([...requestLogs]);
});
// Detailed logs endpoint - Includes request and response data
app.get('/detailed-logs', (req, res) => {
    // Return the detailed logs as JSON
    res.status(200).json([...detailedLogs]);
});
// Endpoint to clear logs (for administrators only)
app.post('/admin/clear-logs', (req, res) => {
    // In a production environment, you would add proper authentication here
    // This is a simple implementation for development
    const secretKey = req.headers['x-admin-key'];
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    // Clear the logs array
    requestLogs.length = 0;
    detailedLogs.length = 0;
    console.log('Logs have been cleared by admin request');
    res.status(200).json({ message: 'Logs cleared successfully' });
});
app.use('/api', api_1.default);
app.use('/api/gmail', gmail_1.default);
app.get('/test-firebase', async (req, res) => {
    try {
        // Let's list all users (up to 1000) from Firebase Auth
        const listUsersResult = await admin.auth().listUsers(10);
        const emails = listUsersResult.users.map((userRecord) => userRecord.email);
        res.send({
            message: "Connected to Firebase Successfully!",
            users: emails,
        });
    }
    catch (error) {
        console.error("Firebase connection test failed:", error);
        res.status(500).send("Firebase connection test failed.");
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
// Start server
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map