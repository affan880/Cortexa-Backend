import { Request, Response, NextFunction } from 'express';
import { extractToken } from '../utils/auth';
const admin = require('../firebaseConfig');

// Extend the Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any; // Using any for DecodedIdToken since we're using require for admin
    }
  }
}

/**
 * Middleware to verify Firebase ID tokens
 */
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idToken = extractToken(req);
    
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized - Missing token' });
    }
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Add user info to request object
    req.user = decodedToken;
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid authentication' });
  }
}; 