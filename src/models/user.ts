import config from '../config'
import { putItem, getItem } from '../dao/dynamodb'

const { tables } = config.aws.dynamo;

// my attributes
export interface IUserObject {
    id: string;
    username: string;
    created: number;
    [key: string]: any;
}

function clean(o: any): IUserObject {
    return {
        id: o.id,
        created: o.pData,
        username: o.pk,
    }
}

export async function create({ id, username, ...meta }: any) {
    const created = Date.now();
    const lookup = {
        pk: id,
        sk: 'USER:LOOKUP',
        pData: created,
        username,
    };

    const user = {
        ...meta,
        pk: username,
        sk: 'USER',
        pData: created,
        id,
    };

    await putItem(tables.chat, lookup);
    await putItem(tables.chat, user);

    return clean(user);
}

export async function read(username: string): Promise<IUserObject|null> {
    const result = await getItem(tables.chat, { pk: username, sk: 'USER' });
    const user = result && result.Item;

    if (user) return clean(user);
    return null;
}

export async function lookup(id: string): Promise<IUserObject|null> {
    const result = await getItem(tables.chat, { pk: id, sk: 'USER:LOOKUP' });
    const record = result && result.Item;

    if (record && record.username) {
        const user = await read(record.username);
        return user;
    }

    return null;
}
