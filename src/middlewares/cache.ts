import { Request, Response, NextFunction } from 'express'
import redis from '../dao/redis'

const resDotSendInterceptor = (res: Response, send: Function) => (content: any) => {
    (res as any).contentBody = content;
    (res as any).send = send;
    res.send(content);
}

export function addCachingStrategy(key: string, ttl: number = 60) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // check cache first, and short circuit
        const cached = await redis.get(key);
        if (cached !== null) {
            console.info(`[cache] HIT: ${key}`);
            return res.json(JSON.parse(cached));
        }

        (res as any).send = resDotSendInterceptor(res, res.send);

        // if we reach this point, let's cache the body for next time
        res.on('finish', async () => {
            // we will assume contentBody is always JSON, and we will add a root timestamp
            const created = (new Date()).getTime();
            const data = JSON.stringify({
                ...(res as any).contentBody,
                created,
            });

            console.info(`[cache] MISS, saving: ${key}`);
            await redis.setEx(key, ttl, data);
        });

        next();
    }
}
