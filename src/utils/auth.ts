import { Request } from 'express';

export function extractToken(req: Request): string | null {
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