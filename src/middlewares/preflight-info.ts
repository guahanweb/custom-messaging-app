import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

export default function preflightInfo() {
    // we are going to do a best guess at the client IP address
    return (req: Request, res: Response, next: NextFunction) => {
        // attach IP address for reference
        const ipAddress = req.header('x-forwarded-for');
        res.locals.ip = ipAddress || req.socket.remoteAddress;

        // we will create a conversationId or relay an existing one
        const conversationId = req.header('x-conversation-id');
        res.locals.conversationId = conversationId || crypto.randomUUID();
        res.setHeader('x-conversation-id', res.locals.conversationId);

        next();
    }
}