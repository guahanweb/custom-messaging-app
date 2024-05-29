import config from './config'
import { createServer } from './server'
import redisClient from './dao/redis'
import * as authClient from './models/auth/client'

if (require.main === module) {
    main();
}

export async function main() {
    // connect dependencies
    redisClient.connect();

    // set up server
    await bootstrap();
    const { server } = await createServer({
        enableSessions: config.server.session.enabled,
    });
    const { port } = config.server;

    server.listen(port);
    console.log(`server is listening on port: ${port}`);
}

async function bootstrap() {
    if (['local', 'development'].includes(config.environment)) {
        if (config.adminClientId) {
            const clientId = await authClient.readClientId(config.adminClientId);

            if (clientId === false) {
                console.log('temporary admin client id does not exist, creating...');
                const ttl = (Date.now() / 1000) + (60 * 60);

                // set up preliminary data for admin access
                await authClient.createClientId({ client_id: config.adminClientId }, ttl);
                const credentials = await authClient.generateKeyPair({
                    client_id: config.adminClientId,
                    scopes: ['admin'],
                }, ttl);

                // let's wait a few seconds then dump the credentials to the console
                setTimeout(() => {
                    console.log('');
                    console.log('TEMPORARY CREDENDIALS!!!');
                    console.log('========================');
                    console.log('Remove this key pair after setting up your own.');
                    console.log('These credentials will expire in 1 hour.');
                    console.log('');
                    console.log(`access_key: ${credentials.access_key}`);
                    console.log(`access_secret: ${credentials.access_secret}`);
                    console.log('');
                }, 5000);
            } else {
                console.log('temporary admin client already exists:', clientId);
            }
        }
    }
}
