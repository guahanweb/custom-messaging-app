import { Request, Response, NextFunction } from 'express'
import * as anonymousId from '../models/anonymous-id'

const MAX_AGE = 365 * 24 * 60 * 60; // 365 days in seconds

export default function (options?: any) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const anonid = anonymousId.decode(req.cookies.anonid);
            res.locals.anonid = anonid.id;
        } catch (err: any) {
            // no anonid, so create one
            const anonid = anonymousId.generate();

            res.locals.anonid = anonid.id;
            res.cookie('anonid', anonymousId.encode(anonid), { maxAge: MAX_AGE })
        }

        next();
    }
}
