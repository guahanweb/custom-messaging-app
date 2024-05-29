import { Router, Request, Response } from 'express'
import * as users from '../../../controllers/user-controller'

export default function() {
    const router = Router();

    router.get('/session', (req: Request, res: Response) => {
        const session = req.session;
        res.send({ session });
    });

    router.get('/logout', (req: Request, res: Response) => {
        req.session.destroy(() => {
            res.send({ ok: true });
        });
    });

    router.post('/', users.register());
    router.post('/login', users.login());

    return router;
}