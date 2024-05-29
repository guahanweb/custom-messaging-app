import { Request, Response } from 'express'
import * as users from '../models/user'

export function register() {
    const requiredFields = ['username', 'password', 'email'];

    return async function (req: Request, res: Response) {
        try {
            if (!requiredFields.every((field: string) => req.body.hasOwnProperty(field))) {
                res.status(422).send({ error: 'unprocessable entity', message: 'missing required properties' });
            } else {
                // TODO: any additional validation
                const user = await users.create(req.body);
                res.send({ user });
            }
        } catch (err: any) {
            console.error(err);
            res.status(500).send({ error: 'unexpected error', message: err.message });
        }
    }
}

export function login() {
    return async function (req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            const user = await users.byCredentials(username, password);

            if (user === null) {
                res.status(401).send({ error: 'unauthorized' });
            } else {
                (req.session as any).user = user;
                res.send({ user });
            }
        } catch (err: any) {
            console.error(err);
            res.status(500).send({ error: 'unexpected error', message: err.message });
        }
    }
}
