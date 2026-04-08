require('dotenv').config();
let moment = require('moment-timezone');
moment.tz.setDefault("Asia/Ho_Chi_Minh");
let cors = require('cors');
let Telegram = require('node-telegram-bot-api');
let TeleMsg = require('./app/Helpers/Telegram');
let telegramPolling = String(process.env.TELEGRAM_POLLING || 'false').toLowerCase() === 'true';
let TelegramBot = new Telegram(process.env.TELEGRAM_TOKEN, { polling: telegramPolling });
const path = require('path');
let express = require('express');
let app = express();
app.disable('etag');
app.use((req, res, next) => {
    const reqPath = String(req.path || '');
    const noCachePaths = [
        '/web',
        '/mobile',
        '/zad199',
        '/service-worker1bce.js',
        '/cocos2d-js-min.js',
        '/main.js',
        '/src/settings.js'
    ];
    if (noCachePaths.some((prefix) => reqPath === prefix || reqPath.startsWith(prefix + '/'))) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, private, max-age=0, s-maxage=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
    }
    next();
});
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}));
let expressWs = require('express-ws')(app);
let bodyParser = require('body-parser');
let morgan = require('morgan');
// Setting & Connect to the Database
let configDB = require('./config/database');
let mongoose = require('mongoose');
require('mongoose-long')(mongoose); // INT 64bit
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(configDB.url, configDB.options); // kết nối tới database
// đọc dữ liệu from
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(morgan('combined'));
app.set('view engine', 'ejs'); // chỉ định view engine là ejs
const cmsPublic = path.join(__dirname, '..', 'cms-develop', 'public');
const cmsViews = path.join(__dirname, '..', 'cms-develop', 'views');
app.set('views', [path.join(__dirname, 'views'), cmsViews]); // view directory
// Serve static html, js, css, and image files
app.use(express.static(cmsPublic));
app.use(express.static('public'));
// Admin entry: friendly /admin -> /zad199
app.get(['/admin', '/admin/'], function(req, res) {
    return res.redirect('/zad199/');
});
app.get('/zad199/', function(req, res) {
    return res.render('main');
});
// server socket
let redT = expressWs.getWss();
process.redT = redT;
redT.telegram = TelegramBot;
global['redT'] = redT; // tạo biến global cho Socket chính để dùng ở mọi nơi
require('./app/Helpers/socketHelper')(redT); // Add function socket User && Admin
require('./app/Helpers/socketHelperAgency')(redT); // Add function socket Agency
require('./routes/routerHttp')(app, redT); // load các routes HTTP
require('./routes/routerSocket')(app, redT); // load các routes WebSocket
const safeRun = (label, fn) => {
    try {
        fn();
    } catch (err) {
        console.error(`[${label}]`, err && err.stack ? err.stack : err);
    }
};
const startBackgroundJobs = () => {
    safeRun('initDataSystem', () => require('./app/Helpers/initDataSystem')()); // init data system
    safeRun('initDataHuGame', () => require('./app/Helpers/initDataHuGame')); // default admin data
    safeRun('configAdmin', () => require('./config/admin')); // default admin config
    safeRun('cronBaucua', () => require('./app/Cron/baucua')(redT)); // run baucua
    safeRun('cronTaixiu', () => require('./app/Cron/taixiu')(redT)); // run taixiu
    safeRun('cronTaixiuChat', () => require('./app/Cron/taixiu/botChatTaixiu')(redT)); // run taixiu chat
    safeRun('cronTaixiuTop', () => require('./app/Cron/taixiu/TopTaiXiuUser')(redT)); // run taixiu top
    safeRun('cronTopHu', () => require('./app/Cron/TopHu')(redT)); // run top hu
    //safeRun('cronMomo', () => require('./app/Cron/momo')(redT)); // momo
    safeRun('cronThongke', () => require('./app/Cron/thongke')(redT)); // fake online stats
    safeRun('cronHuConfig', () => require('./config/cronHu')(redT));
    safeRun('cronConfig', () => require('./config/cron')());
    safeRun('telegramBot', () => require('./app/Telegram/Telegram')(redT)); // Telegram Bot

    safeRun('seedTaiXiu', () => require('./app/Helpers/addPhienTaiXiu')(false)); // seed taixiu rounds
    safeRun('seedBotUsers', () => require('./app/Helpers/initBotCreate')(true)); // create bot users
    safeRun('seedBotChat', () => require('./app/Helpers/initBotChat')(true)); // seed bot chat
    safeRun('seedTcg', () => require('./app/Helpers/initTcgCreate')(false)); // create tcg accounts
    safeRun('teleNotify', () => TeleMsg(process.env.TELEGRAM_LOGS, "79BET-CO\n" + "Server started at: " + moment().format("DD/MM/YYYY h:mm:ss a") + "\n"));
};
setImmediate(startBackgroundJobs);
process.on('unhandledRejection', (err) => {
    console.error('[unhandledRejection]', err && err.stack ? err.stack : err);
});
process.on('uncaughtException', (err) => {
    console.error('[uncaughtException]', err && err.stack ? err.stack : err);
});

// // Utils Test
// const testCase = require('./utils/getUsers');
// testCase.getUser();

// export server handle
module.exports = app;
