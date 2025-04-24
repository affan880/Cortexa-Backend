/**
 * Main application entry point
 */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import testRoutes from './routes/test';
import { UserRecord } from 'firebase-admin/auth';
import gmailRoutes from './routes/gmail';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const admin = require('./firebaseConfig');

// Array to store log entries (simple in-memory store)
const requestLogs: { timestamp: string; method: string; url: string; ip: string | undefined }[] = [];
const MAX_LOG_ENTRIES = 100; // Limit the number of logs stored in memory

// Array to store detailed log entries with request and response data
const detailedLogs: {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  ip: string | undefined;
  requestHeaders: any;
  requestBody: any;
  responseStatus: number;
  responseTime: number;
  responseHeaders: any;
  responseSize: number;
}[] = [];
const MAX_DETAILED_LOGS = 50; // Limit detailed logs to avoid memory issues

const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
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
const detailedLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
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
  const chunks: Buffer[] = [];
  
  // Override write
  res.write = function(chunk: any, encoding?: string, callback?: (error: Error | null | undefined) => void): boolean {
    if (Buffer.isBuffer(chunk)) {
      chunks.push(chunk);
    } else if (typeof chunk === 'string') {
      chunks.push(Buffer.from(chunk));
    }
    return originalWrite.call(res, chunk, encoding as BufferEncoding, callback);
  } as any;
  
  // Override end
  res.end = function(chunk?: any, encoding?: string, callback?: () => void): any {
    if (chunk) {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else if (typeof chunk === 'string') {
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
    
    return originalEnd.call(res, chunk, encoding as BufferEncoding, callback);
  } as any;
  
  next();
};

// Register the middleware to run for ALL incoming requests
app.use(requestLoggerMiddleware);
app.use(detailedLoggerMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Logs endpoint - Access to all logged requests
app.get('/logs', (req: Request, res: Response) => {
  // Return the stored logs as JSON
  // Return a copy to prevent accidental modification
  res.status(200).json([...requestLogs]);
});

// Detailed logs endpoint - Includes request and response data
app.get('/detailed-logs', (req: Request, res: Response) => {
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

app.use('/api', apiRoutes);
app.use('/api', testRoutes);
app.use('/api/gmail', gmailRoutes);

app.get('/test-firebase', async (req, res) => {
  try {
    // Let's list all users (up to 1000) from Firebase Auth
    const listUsersResult = await admin.auth().listUsers(10);
    const emails = listUsersResult.users.map((userRecord: UserRecord) => userRecord.email);

    res.send({
      message: "Connected to Firebase Successfully!",
      users: emails,
    });
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    res.status(500).send("Firebase connection test failed.");
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
}); 