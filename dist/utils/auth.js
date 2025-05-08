"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractToken = extractToken;
function extractToken(req) {
    if (!req.headers.authorization) {
        return null;
    }
    const authHeader = req.headers.authorization;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return null;
    }
    return parts[1];
}
//# sourceMappingURL=auth.js.map