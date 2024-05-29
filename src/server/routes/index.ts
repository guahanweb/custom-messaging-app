import { Router } from 'express'
import authRouter from './authorization'
import chatRouter from './chat'
import userRouter from './users'
import * as processController from '../../controllers/process-controller'

export default function () {
    const router = Router();

    router.use('/auth', authRouter());
    router.use('/chat', chatRouter());
    router.use('/users', userRouter());

    // user scan handler
    router.get(
        '/info',
        processController.info(),
    );

    return router;
}
