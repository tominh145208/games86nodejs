const asyncRedis = require("async-redis");
// Setting & Connect to the Redis
const configRedis = require('../../config/redis');

let redisClient = null;
let redisAvailable = true;

try {
    // create and connect redis client to local instance.
    redisClient = asyncRedis.createClient(configRedis);
} catch (error) {
    redisAvailable = false;
    console.log(`Redis init error: ${error}`);
}

if (redisClient) {
    redisClient.on('connect', () => {
        redisAvailable = true;
    });
    redisClient.on('message', (channel, message) => {});
    redisClient.on('error', (error) => {
        redisAvailable = false;
        console.log(`Redis Error: ${error}`);
    });
}

const safeCall = async (fn, fallback) => {
    if (!redisAvailable || !redisClient) return fallback;
    try {
        return await fn();
    } catch (error) {
        console.log(`Redis Error: ${error}`);
        return fallback;
    }
};

module.exports = {
    set: async (key, value) => {
        await safeCall(() => redisClient.set(key, JSON.stringify(value)), null);
    },
    setex: async (key, time, value) => {
        await safeCall(() => redisClient.setex(key, time, JSON.stringify(value)), null);
    },
    get: async (key) => {
        const data = await safeCall(() => redisClient.get(key), null);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    }
};
