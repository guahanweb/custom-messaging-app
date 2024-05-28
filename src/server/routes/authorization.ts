import { Router, Request, Response } from 'express'
import * as auth from '../../controllers/auth-controller'
import { basicAuthParser, bearerTokenParser } from '../../middlewares/auth-headers'

export default function() {
    const router = Router();

    // manage actual clients and key pairs
    router.post('/clients',
        bearerTokenParser(['admin']), // require admin scope
        auth.createClientId()
    );

    router.post('/clients/:client_id/keys',
        bearerTokenParser(['admin']), // require admin scope
        auth.createAccessKeyPair()
    );

    router.post('/token', basicAuthParser(), auth.authorize());
    router.get('/validate', bearerTokenParser(), async (req: Request, res: Response) => {
        res.send({
            token: res.locals.auth_token,
        });
    });

    return router;
}