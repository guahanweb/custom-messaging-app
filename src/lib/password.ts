import crypto from 'crypto'

export function generateRandomString(length: number) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

export function generateSecretKey(length: number) {
    return crypto.randomBytes(length)
        .toString('base64')
        .slice(0, length);
}

export function sha512(password: string, salt: string) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);

    const value = hash.digest('hex');
    return {
        salt,
        passwordHash: value,
    }
}

export function saltHashPassword(password: string, salt_length: number = 16) {
    const salt = generateRandomString(salt_length);
    const passwordData = sha512(password, salt);
    return passwordData;
}

export function validate(password: string, hash: string, salt: string) {
    const passwordData = sha512(password, salt);
    return passwordData.passwordHash === hash;
}

export function encodeBasicAuth(user: string, pass: string) {
    return Buffer.from(`${user}:${pass}`).toString('base64');
}

export function decodeBasicAuth(token: string) {
    const parts = Buffer.from(token, 'base64').toString('ascii').split(':');
    
    if (parts.length !== 2) throw new Error('basic auth malformed');

    return {
        user: parts[0],
        pass: parts[1],
    };
}
