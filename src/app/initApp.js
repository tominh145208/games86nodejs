let SysInformation = require('./Models/System/Sys_Information');
let SysGameStatus = require('./Models/System/Sys_GameStatus');
let MomoConfig = require('./Models/Momo/MomoConfig');
const axios = require('axios');

module.exports = async (redT) => {
    try {
        let getMomoConfig = async () => {
            try {
                let getData = await axios({
                    method: 'get',
                    url: 'https://ft.1spay.online/api/momo/info?name=ft90&key=62960bb37579ae8bdddee5786e4d599b',
                    headers: {},
                    // Prevent client from hanging forever at "Đang kết nối" when external API is unreachable.
                    timeout: Number(process.env.MOMO_CONFIG_TIMEOUT_MS || 3000)
                });

                getData = getData.data;
                if (!!getData) {
                    if (getData.data !== null) {
                        const momo = getData.data[0];
                        return {
                            phone: momo.phone,
                            name: momo.name,
                            capset: momo.capset,
                            recei: momo.recei,		
                            errCode: null
                        }
                    }else {
                        return {
                            phone: 'xxxxxxxx',
                            name: 'xxxxxxxx',
                            errCode: 'config null data'
                        }
                    }
                } else {
                    return {
                        phone: 'xxxxxxxx',
                        name: 'xxxxxxxx',
                        errCode: 'err get config request'
                    }
                }
            }catch(e) {
                return {
                    phone: 'xxxxxxxx',
                    name: 'xxxxxxxx',
                    errCode: e.message
                }
            }
        }




        let getDataSys = async (models, key) => {
            try {
                const getData = await models.findOne({ key });
                if (!!getData) {
                    return getData.value;
                } else {
                    return null;
                }
            } catch (e) {
                console.log(e);
            }
        };

        let getGameStatusSafe = async (key) => {
            const value = await getDataSys(SysGameStatus, key);
            if (value === null || typeof value === 'undefined') {
                return true;
            }
            return !!value;
        };
        const data = {
            initApp: {
                information: {
                    version: await getDataSys(SysInformation, "version"),
                    telegram: await getDataSys(SysInformation, "telegram"),
                    telegramBot: await getDataSys(SysInformation, "telegramBot"),
                    telesupport: await getDataSys(SysInformation, "telesupport"),
                    zalo: await getDataSys(SysInformation, "zalo"),
                    fanpage: await getDataSys(SysInformation, "fanpage"),
                    quickChat: await getDataSys(SysInformation, "quickChat"),
                    ios: await getDataSys(SysInformation, "ios"),
                    android: await getDataSys(SysInformation, "android"),
                },
                gameStatus: {
                    taixiu: await getGameStatusSafe("taixiu"),
                    xocxoc: await getGameStatusSafe("xocxoc"),
                    rongho: await getGameStatusSafe("rongho"),
                    baucua: await getGameStatusSafe("baucua"),
                    lode: await getGameStatusSafe("lode"),
                    kbet: await getGameStatusSafe("kbet"),
                    pocker: await getGameStatusSafe("pocker"),
                    candy: await getGameStatusSafe("candy"),
                    bacay: await getGameStatusSafe("bacay"),
                    caothap: await getGameStatusSafe("caothap"),
                    minipoker: await getGameStatusSafe("minipoker"),
                    pubg: await getGameStatusSafe("pubg"),
                    casinoroyale: await getGameStatusSafe("casinoroyale"),
                    sieuxe: await getGameStatusSafe("sieuxe"),
                    avengers: await getGameStatusSafe("avengers"),
                    panda: await getGameStatusSafe("panda"),
                    lmht: await getGameStatusSafe("lmht"),
                    banca: await getGameStatusSafe("banca"),
                    mienvientay: await getGameStatusSafe("mienvientay"),
                    dongmauanhhung: await getGameStatusSafe("dongmauanhhung"),
                    //frozen: await getDataSys(SysGameStatus, "frozen"),
                    frozen: false,
                    daihaitrinh: await getGameStatusSafe("daihaitrinh"),
                    cowboy: await getGameStatusSafe("cowboy"),
                    tamhung: await getGameStatusSafe("tamhung"),
                    momo: await getGameStatusSafe("momo"),
                },
                momo: await getMomoConfig()
            }
        };
        redT.send(JSON.stringify(data));

        const notifyPin = await getDataSys(SysInformation, "notifyPin");
        if (notifyPin != "") {
            try {
                contentNotify = JSON.parse(notifyPin);
                redT.send(JSON.stringify({
                    news: {
                        thongbao: contentNotify
                    }
                }));
            } catch (e) { }
        }
    } catch (e) {
        console.log(e.message);
    }
}
