import { Router } from 'express'
import * as chatController from '../../../controllers/chat-controller'

export default function() {
    const router = Router();

    router.post('/conversations', chatController.createConversation());
    router.get('/conversations/:conversationId', chatController.fetchConversation());
    router.post('/conversations/:conversationId', chatController.addMessage());

    return router;
}
