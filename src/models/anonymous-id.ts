import crypto from 'crypto'

interface IAnonymousIdentifier {
    id: string;
    created: number;
}

export function generate(): IAnonymousIdentifier {
    return {
        id: crypto.randomUUID(),
        created: (new Date()).getTime(),
    }
}

export function decode(payload: string): IAnonymousIdentifier {
    return JSON.parse(payload);
}

// for now, just JSON stringify for simplicity
export function encode(identity: IAnonymousIdentifier): string {
    return JSON.stringify(identity);
}
