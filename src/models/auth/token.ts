import config from '../../config'
import * as pw from '../../lib/password'
import { putItem, getItem } from '../../dao/dynamodb'

const TOKEN = 'TOKEN';

const { tables } = config.aws.dynamo;

interface ITokenOpts {
    client_id: string;
    scopes: string[];
    type: string;
}

function cleanToken(data: any) {
    return {
        access_token: data.pk,
        client_id: data.client_id,
        scopes: data.scopes,
        type: data.type,
        expires_in: data.ttl - Math.floor(Date.now() / 1000),
    };
}

export async function create(data: ITokenOpts) {
    const ttl = Math.round((Date.now() / 1000) + config.authTTL);
    const access_token = pw.generateRandomString(32);
    const { client_id, scopes, type } = data;

    const Item = {
        pk: access_token,
        sk: TOKEN,
        client_id,
        scopes,
        type,
        ttl,
    };

    await putItem(tables.clients, Item);
    return cleanToken(Item);
}

export async function read(tok: string) {
    const result = await getItem(tables.clients, { pk: tok, sk: TOKEN });
    const Item = result && result.Item;
    
    if (!Item) return false;

    return cleanToken(Item);
}
