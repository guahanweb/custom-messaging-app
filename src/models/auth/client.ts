import config from '../../config'
import * as pw from '../../lib/password'
import { putItem, getItem } from '../../dao/dynamodb'
import { create as createToken } from './token'

interface ICreateClientOpts {
    client_id: string;
}

interface IGenerateKeysOpts {
    client_id: string;
    scopes?: string[];
}

const { tables } = config.aws.dynamo;

const CLIENT = 'CLIENT';
const API_KEY = 'KEY';

function cleanClient(data: any) {
    const result = {
        ...data,
        client_id: data.pk,
    };

    delete result.pk;
    delete result.sk;
    delete result.pData;

    return result;
}

function cleanApiKey(data: any) {
    return {
        access_key: data.pk,
        created: data.created,
        client_id: data.client_id,
        scopes: data.scopes,
        passwordHash: data.passwordHash,
        salt: data.salt,
    }
}

export async function createClientId(data: ICreateClientOpts, ttl?: number) {
    const created = (new Date()).getTime();
    const Item: any = {
        ...data,
        pk: data.client_id,
        sk: CLIENT,
        created,
    };

    if (ttl) {
        Item.ttl = ttl;
    }

    await putItem(tables.clients, Item);

    return cleanClient(Item);
}

export async function readClientId(client_id: string) {
    const result = await getItem(tables.clients, { pk: client_id, sk: CLIENT });
    const Item = result && result.Item;

    if (!Item) {
        return false;
    }

    return cleanClient(Item);
}

export async function generateKeyPair(data: IGenerateKeysOpts, ttl?: number) {
    // key pair
    const access_key = pw.generateRandomString(20).toUpperCase();
    const access_secret = pw.generateSecretKey(40);

    // additional information (will be used for scoping and auth)
    const client_id = (data && data.client_id) || null;
    const scopes = (data && data.scopes) || [];

    // short circuit if we don't have a client id provided
    if (client_id === null) throw new Error('access key pair requires client_id');

    const { passwordHash, salt } = pw.saltHashPassword(access_secret);
    const created = (new Date()).getTime();
    const Item: any = {
        pk: access_key,
        sk: API_KEY,
        pData: `${client_id}:${created}`,
        client_id,
        created,
        scopes,
        passwordHash,
        salt,
    };

    if (ttl) {
        Item.ttl = ttl;
    }

    // we only attach the `access_secret` to the creation action.
    // it will never be readable again and can only be regenerated.
    await putItem(tables.clients, Item);
    return {
        ...cleanApiKey(Item),
        access_secret,
    };
}

export async function getKeyPair(access_key: string) {
    const result = await getItem(tables.clients, { pk: access_key, sk: API_KEY });
    const Item = result && result.Item;

    if (!Item) return false;

    return cleanApiKey(Item);
}

export async function createAccessToken(access_key: string, access_secret: string) {
    const key = await getKeyPair(access_key);
    if (false === key) throw new Error('invalid access_key provided');

    const { passwordHash, salt } = key;
    
    if (!pw.validate(access_secret, passwordHash, salt)) {
        throw new Error('invalid credentials provided');
    }

    // TODO: apply token level scoping rather than all-in
    const tok = await createToken({
        client_id: key.client_id,
        scopes: key.scopes,
        type: 'BEARER',
    });

    return tok;
}
