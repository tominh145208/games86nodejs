let DEBUG = true;
let SocketUrl;
let ConfigDataUrl;

// CMS local chạy cổng 8989, game server websocket chạy cổng 2004.
const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
const searchParams = new URLSearchParams(window.location.search || '');
const wsHostFromQuery = (searchParams.get('wsHost') || '').trim();
if (wsHostFromQuery) {
    localStorage.setItem('cms_ws_host', wsHostFromQuery);
}
const wsHostOverride = (localStorage.getItem('cms_ws_host') || '').trim();
const currentHostWithPort = window.location.host; // includes port if present
if (wsHostOverride) {
    SocketUrl = `${wsProtocol}://${wsHostOverride}/cms102`;
} else {
    SocketUrl = `${wsProtocol}://${currentHostWithPort}/cms102`;
}
const normalizeApiHost = (value) => {
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    return `${window.location.protocol}//${value}`;
};
const apiHostFromQuery = (searchParams.get('apiHost') || '').trim();
if (apiHostFromQuery) {
    localStorage.setItem('cms_api_host', apiHostFromQuery);
}
const apiHostOverride = (localStorage.getItem('cms_api_host') || '').trim();
const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
if (apiHostOverride) {
    ConfigDataUrl = normalizeApiHost(apiHostOverride);
} else if (isLocalHost) {
    // Local dev: avoid HTTPS/SNI errors on some networks
    ConfigDataUrl = "http://api.79bet.co";
} else {
    // default: same origin to work over tunnels/proxy
    ConfigDataUrl = `${window.location.protocol}//${currentHostWithPort}`;
}

let scriptPath = [
    '/js/dashboard.js',
    '/js/helpers.js',
    '/js/main.js',
    '/js/menu.js',
    '/js/auth/login.js',
    '/js/auth/doimatkhau.js',
    '/js/tool/guithongbao.js',
    '/js/game/slot.js',
    '/js/game/taixiu.js',
    '/js/game/baucua.js',
    '/js/game/xocdia.js',
    '/js/game/rongho.js',
    '/js/game/momo.js',
    '/js/card/napthe.js',
    '/js/card/rutthe.js',
    '/js/card/quanly.js',
    '/js/bank/rut.js',
    '/js/bank/nap.js',
    '/js/bank/quanly.js',
    '/js/member/user.js',
    '/js/member/daily.js',
    '/js/giftcode/quanly.js',
    '/js/giftcodeone/quanly.js',
    '/js/system/quanly.js',
    '/js/system/quanlycms.js',
    '/js/system/getlog.js',
    '/js/system/ipBlackList.js',
    '/js/member/history/userPlayTaixiu.js',
    '/js/member/history/userChuyenTien.js',
    '/js/member/history/userTransaction.js',
    '/js/history/chuyentien.js',
];

let SENCE_ENUM = {
    MAIN: "main",
    TAIXIU: "taixiu",
    BAUCUA: "baucua",
    XOCXOC: "xocdia",
    RONGHO: "rongho",
    CAOBOI: "caoboi",
    SIEUXE: "sieuxe",
    ROYAL: "royal",
    DMANHHUNG: "dmanhhung",
    SEXANDZEN: "sexandzen",
    DAOHAITAC: "daohaitac",
    MINIPOKER: "mini_poker",
    MINI3CAY: "mini3cay",
    MINICANDY: "big_babol",
    PUBG: "angrybird",
    MIENVIENTAY: "vq_red",
    PANDA: "candy",
    AVENGERS: "longlan",
    LMHT: "zeus",
    YEUCAUNAPTHE: "yeucaunapthe",
    YEUCAURUTTHE: "yeucaurutthe",
    NGANHANGNAP: "nganhangnap",
    NGANHANGRUT: "nganhangrut",
    QUANLYNGANHANG: "quanlynganhang",
    QUANLYTHECAO: "quanlythecao",
    QUANLYNGUOIDUNG: "quanlynguoidung",
    QUANLYCMS: "quanlycms",
    CMSLOG: "cmslog",
    BLACKLISTIP: "blacklistip",
    QUANLYDAILY: "quanlydaily",
    GIFTCODE: "giftcode",
    GIFTCODEONE: "giftcodeone",
    DOIMATKHAU: "doimatkhau",
    GUITHONGBAO: "guithongbao",
    CLEARTRASH: "cleartrash",
    SYSTEM: "system",
    LICHSUCHUYENTIEN: "lichsuchuyentien",
    BIENDONGSODU: "biendongsodu",
    CHANLEMOMO: "chanlemomo"
};

// SOCKET CHECK BROWSER
if ("WebSocket" in window) {} else {
    alert("Trình duyệt của bạn không được hỗ trợ Websocket vui lòng đổi trình duyệt khác để sử dụng!");
}

$(document).ready((e) => {
    for (let path of scriptPath) {
        eval(function(p, a, c, k, e, d) {
            e = function(c) { return c };
            if (!''.replace(/^/, String)) {
                while (c--) { d[c] = k[c] || c }
                k = [function(e) { return d[e] }];
                e = function() { return '\\w+' };
                c = 1
            };
            while (c--) { if (k[c]) { p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]) } }
            return p
        }('$("4").3(`<0 2="${1}"></0>`);', 5, 5, 'script|path|src|append|head'.split('|'), 0, {}))
    }
});

// debug console
if (!DEBUG) {
    if (!window.console) window.console = {};
    var methods = ["log", "debug", "warn", "info"];
    for (var i = 0; i < methods.length; i++) {
        console[methods[i]] = function() {};
    }
}

// varible save ip andress
let cmsLoginIpAndress = '';

$.ajax({
    "url": "https://api.ipify.org/?format=text",
    "method": "GET",
    "timeout": 0,
}).done(function(response) {
    if (response) cmsLoginIpAndress = response;
});
