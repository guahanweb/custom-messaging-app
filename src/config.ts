import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

const environment = loadFromEnv('NODE_ENV', 'development');
loadDotEnv(environment);

function loadDotEnv(env: string) {
    const fallbackList = [
        `.${env}.env`,
        `.env`,
    ];

    let exists = false;
    while (!exists && fallbackList.length) {
        const file = fallbackList.shift();
        const filename = path.resolve(__dirname, `../env/${file}`);

        exists = fs.existsSync(filename);
        if (exists) {
            dotenv.config({ path: filename });
            console.info('env file found:', filename);
        }
    }

    if (!exists) {
        console.info('no env file found!');
    }
}

export interface AwsConfig {
    endpoint?: string;
    dynamo: {
        apiVersion?: string;
        endpoint?: string;
        region?: string;

        tables: {
            clients: string;
            chat: string;
        }
    }
}

export interface RedisConfig {
    url?: string;
    password?: string;
}

export interface ServerConfig {
    port: number | null;
    host?: string | null;

    session: {
        enabled: boolean;
        secret?: string;
    }
}

export interface AppConfig {
    authTTL: number;
    environment: string;
    logLevel: string;
    adminClientId: string;
    server: ServerConfig;
    dataPath: string;
    aws: AwsConfig;
    redis: RedisConfig;
}

const init = function(): AppConfig {
    const config = {
        environment,
        adminClientId: loadFromEnv('ADMIN_CLIENT_ID'),
        authTTL: loadFromEnv('AUTH_TOKEN_TTL', (15 * 60)), // default to 15 minutes
        logLevel: loadFromEnv('LOG_LEVEL', 'info'),
        dataPath: path.resolve(__dirname, '../_data'),
        server: {
            port: loadFromEnv('PORT', 4000),
            host: loadFromEnv('HOST', 'localhost'),

            session: {
                enabled: loadFromEnv('ENABLE_SESSIONS', false),
                secret: 'testing-123',
            }
        },
        aws: {
            endpoint: loadFromEnv('AWS_ENDPOINT', undefined),

            dynamo: {
                apiVersion: loadFromEnv('AWS_DYNAMODB_APIVERSION', "2012-08-10"),
                endpoint: loadFromEnv('AWS_DYNAMODB_ENDPOINT', undefined),
                region: loadFromEnv('AWS_REGION', 'us-east-1'),

                tables: {
                    clients: loadFromEnv('AWS_DYNAMODB_CLIENT_TABLE', 'development-clients'),
                    chat: loadFromEnv('AWS_DYNAMODB_CHAT_TABLE', 'development-chats'),
                }
            }
        },
        redis: {
            url: loadFromEnv('REDIS_URL', 'redis://localhost:6379'),
            password: loadFromEnv('REDIS_PASSWORD', ''),
        },
    };

    return config;
}

export default init();

function loadFromEnv(key: string, defaultValue: any = null) {
    const value = process.env && process.env[key];
    return value || defaultValue;
}
