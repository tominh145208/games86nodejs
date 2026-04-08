require('dotenv').config();
const assert = require('assert');
const {
    MONGODB_URI,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_NAME
} = process.env;

const baseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

if (MONGODB_URI) {
    module.exports = {
        url: MONGODB_URI,
        options: {
            ...baseOptions,
            ...(DATABASE_USERNAME ? { user: `${DATABASE_USERNAME}` } : {}),
            ...(DATABASE_PASSWORD ? { pass: `${DATABASE_PASSWORD}` } : {}),
            ...(DATABASE_NAME ? { dbName: `${DATABASE_NAME}` } : {}),
        },
    };
} else {
    assert(DATABASE_HOST, "DATABASE_HOST configuration is required." );
    assert(DATABASE_PORT, "DATABASE_PORT configuration is required." );
    assert(DATABASE_NAME, "DATABASE_NAME configuration is required." );

    module.exports = {
        url: `mongodb://${DATABASE_HOST}:${DATABASE_PORT}`,
        options: {
            ...baseOptions,
            user: `${DATABASE_USERNAME}`,
            pass: `${DATABASE_PASSWORD}`,
            dbName: `${DATABASE_NAME}`,
            ssl: false,
            //'autoIndex':       false,
        },
    };
}
