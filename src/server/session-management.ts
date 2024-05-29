import RedisStore from 'connect-redis'
import redisClient from '../dao/redis'
import session from 'express-session'
import config from '../config'
import { Express } from 'express'

export function initialize(app: Express) {
    const redisStore = new RedisStore({ client: redisClient });
    const { secret }: any = config.server.session;
    console.log('initializing sessions');

    app.use(
        session({
            store: redisStore,
            secret,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false,
                httpOnly: false,
                maxAge: 1000 * 60 * 60 * 3,
            }
        })
    );
}

