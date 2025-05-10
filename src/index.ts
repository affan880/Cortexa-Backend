/**
 * Main application entry point
 */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { UserRecord } from 'firebase-admin/auth';
import gmailRoutes from './routes/gmail';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080; // Railway uses 8080 by default

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Plexar API is running' });
});

app.use('/api', apiRoutes);
app.use('/api/gmail', gmailRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
}); 