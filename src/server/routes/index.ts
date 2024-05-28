import { Router } from 'express'
import authRouter from './authorization'
import chatRouter from './chat'
import * as processController from '../../controllers/process-controller'

export default function (opts?: any) {
    const router = Router();

    router.use('/auth', authRouter());
    router.use('/chat', chatRouter());

    // user scan handler
    router.get(
        '/info',
        processController.info(),
    );

    return router;
}
