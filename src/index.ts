/**
 * Main application entry point
 */
import express from 'express';
import dotenv from 'dotenv';
import { UserRecord } from 'firebase-admin/auth';

// Use relative path for runtime compatibility
import aiRoutes from './routes/ai.routes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const admin = require('./firebaseConfig');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use("/api", aiRoutes);

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
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 