require('dotenv').config();
const app = require('./src/app'); // load express handle

/**
 * Start Express server.
 */
const port = process.env.PORT || 2004;
const host = '0.0.0.0';
const server = app.listen(port, host, () => {
    console.log(
        ">>> Server is running at port %d in %s mode",
        port,
        process.env.ENV_ENVIROMENT
    );
    console.log(">>> Press CTRL-C to stop server\n");
});
