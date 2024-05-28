import { createClient } from 'redis'
import config from '../config'

const redisClient = createClient({
    url: config.redis.url,
    password: config.redis.password,
});

redisClient.on('error', function (err: any) {
    console.error('Could not establish connection with redis.', err);
});

redisClient.on('connect', function () {
    console.info('Connected to redis successfully');
});

export default redisClient;
