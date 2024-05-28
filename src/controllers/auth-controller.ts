import { Request, Response } from 'express'
import * as client from '../models/auth/client'

export function createClientId() {
    return async (req: Request, res: Response) => {
        const { client_id } = req.body;
        const result = await client.createClientId({ client_id });
        res.send({ client: result });
    }
}

export function createAccessKeyPair() {
    return async (req: Request, res: Response) => {
        const { client_id } = req.params;
        const { scopes = [] } = req.body;
        const result = await client.generateKeyPair({ client_id, scopes });
        res.send({ credentials: result });
    }
}

export function authorize() {
    return async (req: Request, res: Response) => {
        try {
            const { access_key, access_secret } = res.locals;
            const token = await client.createAccessToken(access_key, access_secret);
            res.send({ token });
        } catch (err: any) {
            console.warn(err);
            res.status(401).send('unauthorized');
        }
    }
}
