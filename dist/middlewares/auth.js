"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const auth_1 = require("../utils/auth");
const admin = require('../firebaseConfig');
/**
 * Middleware to verify Firebase ID tokens
 */
const authenticateUser = async (req, res, next) => {
    try {
        const idToken = (0, auth_1.extractToken)(req);
        if (!idToken) {
            return res.status(401).json({ error: 'Unauthorized - Missing token' });
        }
        // Verify the token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        // Add user info to request object
        req.user = decodedToken;
        next();
    }
    catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ error: 'Invalid authentication' });
    }
};
exports.authenticateUser = authenticateUser;
//# sourceMappingURL=auth.js.map