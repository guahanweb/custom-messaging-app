import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import config from '../config'
import { putItem, query } from '../dao/dynamodb'
import crypto from 'crypto'

const { tables } = config.aws.dynamo;

export interface IMessageObject {
    id: string;
    author: string;
    timestamp: number;
    content: string;
    conversationId: string;
    attachments: any[]; // TODO: support message attachments
}

function clean({ pk, author, content, timestamp, conversationId, attachments }: any) {
    return {
        id: pk,
        author,
        content,
        timestamp,
        conversationId,
        attachments,
    };
}

export async function create({ author, content, conversationId }: any) {
    const id = crypto.randomUUID();
    const created = Date.now();

    const message = {
        pk: id,
        sk: `MSG:${conversationId}`,
        pData: created.toString(),
        author,
        content,
        timestamp: created,
        conversationId,
        attachments: [],
    };

    await putItem(tables.chat, message);
    return clean(message);
}

export async function listByConversation(conversationId: string, lastIndex = null) {
    const options: QueryCommandInput = {
        TableName: tables.chat,
        IndexName: 'sk-pData',
        ScanIndexForward: false,
        KeyConditionExpression: 'sk = :sk',
        ExpressionAttributeValues: { ':sk': `MSG:${conversationId}` },
        Limit: 100,
    };

    if (lastIndex !== null) {
        options.ExclusiveStartKey = lastIndex;
    }

    const result = await query(options);
    const records = result && result.Items;

    return records
        ? records.map(clean)
        : [];
}
