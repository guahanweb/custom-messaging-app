import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    QueryCommand,
    UpdateCommand,
    QueryCommandInput,
} from '@aws-sdk/lib-dynamodb'
import config from '../config'

const client = new DynamoDBClient(config.aws.dynamo);
const docClient = DynamoDBDocumentClient.from(client);

export function putItem(TableName: string, Item: any) {
    const command = new PutCommand({ TableName, Item });
    return docClient.send(command);
}

export function updateItem(TableName: string, Key: any, data: any) {
    const ExpressionAttributeNames: any = {};
    const ExpressionAttributeValues: any = {};
    const updates: string[] = [];

    Object.entries(data).forEach(([key, value]) => {
        ExpressionAttributeNames[`#${key}`] = key;
        ExpressionAttributeValues[`:${key}`] = value;
        updates.push(`#${key} = :${key}`);
    });

    const command = new UpdateCommand({
        TableName,
        Key,
        UpdateExpression: `set ${updates.join(', ')}`,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
    });

    return docClient.send(command);
}

export function getItem(TableName: string, Key: any) {
    const command = new GetCommand({ TableName, Key });
    return docClient.send(command);
}

export function appendToList(TableName: string, Key: any, attr: string, value: string|number) {
    const command = new UpdateCommand({
        TableName,
        Key,
        UpdateExpression: 'set #attr = list_append (#attr, :value)',
        ConditionExpression: 'not contains (#attr, :value)',
        ExpressionAttributeNames: {
            '#attr': attr,
        },
        ExpressionAttributeValues: {
            ':value': value,
        },
        ReturnValues: 'ALL_NEW',
    });

    return docClient.send(command);
}

export function query(options: QueryCommandInput) {
    const command = new QueryCommand(options);
    return docClient.send(command);
}
