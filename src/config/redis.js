require('dotenv').config();
const assert = require('assert');
const {
    REDIS_URL,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_PASSWORD
} = process.env;

if (REDIS_URL) {
    module.exports = {
        url: REDIS_URL
    };
} else {
    assert(REDIS_HOST, "REDIS_HOST configuration is required." );
    assert(REDIS_PORT, "REDIS_PORT configuration is required." );

    module.exports = { 
        url: `redis://${REDIS_PASSWORD || ''}@${REDIS_HOST}:${REDIS_PORT}`
    };
}
