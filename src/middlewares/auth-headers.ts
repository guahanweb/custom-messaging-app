import { Request, Response, NextFunction } from 'express'
import * as token from '../models/auth/token'
import { decodeBasicAuth } from '../lib/password'

export function basicAuthParser() {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const authorization = req.header('authorization');
            if (!authorization) throw new Error('no authorization header provided');

            const m = authorization.match(/^basic\s+(.*)$/i);
            if (!m) throw new Error('invalid authorization header for basic auth');

            // set the access_key and access_secret for handlers
            const { user, pass } = decodeBasicAuth(m[1]);
            res.locals.access_key = user;
            res.locals.access_secret = pass;

            next();
        } catch (err: any) {
            console.error(err);
            res.status(401).send({
                error: 'unauthorized',
            });
        }
    }
}

export function bearerTokenParser(requiredScopes?: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authorization = req.header('authorization');
            if (!authorization) throw new Error('no authorization header provided');

            const m = authorization.match(/^bearer\s+(.*)$/i);
            if (!m) throw new Error('invalid authorization header for bearer auth');

            // validate the token is current, has proper scopes, and relay client_id
            const result = await token.read(m[1]);
            if (false === result) throw new Error('invalid token provided');
            if (result.expires_in <= 0) throw new Error('token is expired');

            if (requiredScopes) {
                const validScopes = requiredScopes.every((scope: string) => result.scopes.includes(scope));
                if (!validScopes) {
                    // authorized but invalid permissions, so 403 here
                    return res.status(403).send('insufficient permissions');
                }
            }

            res.locals.client_id = result.client_id;
            res.locals.auth_token = result;

            next();
        } catch (err: any) {
            console.error(err);
            res.status(401).send({
                error: 'unauthorized',
            });
        }
    }
}
