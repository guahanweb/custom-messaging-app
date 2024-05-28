import config from '../config'
import { putItem, getItem, updateItem, appendToList } from '../dao/dynamodb'
import crypto from 'crypto'

const { tables } = config.aws.dynamo;

export interface IConversationObject {
    id: string;
    members: string[];
    created: number;
    title?: string;
}

function clean({ pk, created, title, members, lastTimestamp, ...meta }: any) {
    return {
        ...meta,
        id: pk,
        created,
        title,
        members,
        lastTimestamp,
    };
}

export async function create({ title = null, members = [], ...meta }: any) {
    const id = crypto.randomUUID();
    const created = Date.now();
    const conversation = { 
        ...meta,
        pk: id,
        sk: 'CHAT',
        pData: created.toString(),
        created,
        title,
        members,
        lastTimestamp: Date.now(),
    };

    await putItem(tables.chat, conversation);
    return clean(conversation);
}

export async function read(id: string) {
    const result = await getItem(tables.chat, { pk: id, sk: 'CHAT' });
    const conversation = result && result.Item;

    return conversation
        ? clean(conversation)
        : null;
}

export async function touch(id: string) {
    await updateItem(tables.chat, { pk: id, sk: 'CHAT' }, { lastTimestamp: Date.now() });
    return true;
}

export async function addMember(id: string, username: string) {
    const result = await appendToList(tables.chat, { pk: id, sk: 'CHAT' }, 'members', username);
    const conversation = result || null;
    return clean(conversation);
}
