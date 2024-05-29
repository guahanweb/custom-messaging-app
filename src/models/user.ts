import config from '../config'
import { putItem, getItem, updateItem } from '../dao/dynamodb'
import * as pw from '../lib/password'

const { tables } = config.aws.dynamo;

// my attributes
export interface IUserObject {
    id: string;
    username: string;
    email: string;
    verified: boolean;
    created: number;
    [key: string]: any;
}

function clean(o: any): IUserObject {
    return {
        id: o.id,
        created: o.created,
        username: o.pk,
        email: o.email,
        verified: o.verified || false,
    }
}

export async function create({ email, username, password, ...meta }: any) {
    const created = Date.now();
    const id = crypto.randomUUID();
    const { passwordHash, salt } = pw.saltHashPassword(password);

    const lookup = {
        pk: email,
        sk: 'USER:LOOKUP',
        pData: created.toString(),
        username,
        created,
    };

    const user = {
        ...meta,
        pk: username,
        sk: 'USER',
        pData: created.toString(),
        email,
        id,
        created,
        passwordHash,
        salt,
        verified: false,
    };

    console.log('lookup:', lookup);
    console.log('user:', user);

    await putItem(tables.chat, lookup);
    await putItem(tables.chat, user);

    return clean(user);
}

export async function byCredentials(username: string, password: string): Promise<IUserObject|null> {
    const user = await read(username, true);
    if (user === null) return null;

    // verify password is accurate before returning
    return pw.validate(password, user.passwordHash, user.salt)
        ? clean(user)
        : null;
}

export async function read(username: string, raw: boolean = false): Promise<IUserObject|null> {
    const result = await getItem(tables.chat, { pk: username, sk: 'USER' });
    const user = result && result.Item;

    if (user) {
        return (raw ? user : clean(user)) as IUserObject;
    }
    return null;
}

export async function update(username: string, data: any) {
    const result = await updateItem(tables.chat, { pk: username, sk: 'USER' }, { ...data });
    return result;
}

export async function lookup(email: string): Promise<IUserObject|null> {
    const result = await getItem(tables.chat, { pk: email, sk: 'USER:LOOKUP' });
    const record = result && result.Item;

    if (record && record.username) {
        const user = await read(record.username);
        return user;
    }

    return null;
}
