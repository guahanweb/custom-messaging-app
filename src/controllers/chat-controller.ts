import { Request, Response } from 'express'
import * as conversation from '../models/conversation'
import * as message from '../models/message'

export function createConversation() {
    return async function (req: Request, res: Response) {
        try {
            const { title, members } = req.body;
            const firstMessage = req.body.message;

            const response = await conversation.create({
                members,
                title,
            });

            const initialMessage = await message.create({
                conversationId: response.id,
                author: firstMessage.author,
                content: firstMessage.content,
            });

            res.send({
                ...response,
                messages: [initialMessage],
            });
        } catch (err: any) {
            console.error(err);
            res.status(500).send({ error: 'unexpected error' });
        }
    }
}

export function addMessage() {
    return async function (req: Request, res: Response) {
        try {
            const { conversationId } = req.params;
            const data = req.body;
            const result = await message.create({
                conversationId,
                author: data.author,
                content: data.content,
            });
            await conversation.touch(conversationId);
            res.send({ ...result });
        } catch (err: any) {
            console.error(err);
            res.status(500).send({ error: 'unexpected error' });
        }
    }
}

export function fetchConversation() {
    return async function (req: Request, res: Response) {
        const { conversationId } = req.params;

        try {
            const response = await conversation.read(conversationId);
            if (response === null) {
                // short-circuit if we cannot find it
                return res.status(404).send({ error: 'not found' });
            }
            
            // TODO: load any additional information for this chat
            const messages = await message.listByConversation(conversationId);

            res.send({
                ...response,
                messages,
            });
        } catch (err: any) {
            console.error(err);
            res.status(500).send({ error: 'unexpected error' });
        }
    }
}
