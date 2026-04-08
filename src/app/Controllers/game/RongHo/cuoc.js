require('dotenv').config();
let RongHo_cuoc = require('../../../Models/RongHo/RongHo_cuoc');
let UserInfo = require('../../../Models/UserInfo');
let telegram = require('../../../Helpers/Telegram');
let helpers = require('../../../Helpers/Helpers');

let UserHistory = require('../../../Models/UserHistory');
let UserHistoryEnums = require('../../../../config/userHistoryEnums');

module.exports = function(client, data) {
    if (!data || !data.cuoc || !data.box || !data.box.red) {
        return;
    }

    let cuoc = data.cuoc >> 0;
    let red = !!data.red;
    let box = data.box;

    if (client.redT.rongho.time < 5 || client.redT.rongho.time > 30) {
        client.red({ rongho: { notice: 'Vui long cuoc o phien sau.!!' } });
        return;
    }

    if (
        box.red.rong === 0 &&
        box.red.ho === 0 &&
        box.red.hoa === 0 &&
        box.red.ro === 0 &&
        box.red.co === 0 &&
        box.red.bich === 0 &&
        box.red.tep === 0
    ) {
        client.red({ rongho: { notice: 'Cuoc that bai...' } });
        return;
    }

    if (
        box.red.rong < 0 ||
        box.red.ho < 0 ||
        box.red.hoa < 0 ||
        box.red.ro < 0 ||
        box.red.co < 0 ||
        box.red.bich < 0 ||
        box.red.tep < 0
    ) {
        client.red({ rongho: { notice: 'Cuoc that bai...' } });
        return;
    }

    let tongTien = (
        box.red.rong +
        box.red.ho +
        box.red.hoa +
        box.red.ro +
        box.red.co +
        box.red.bich +
        box.red.tep
    ) * 1;

    if (tongTien <= 0) {
        client.red({ rongho: { notice: 'Cuoc that bai...' } });
        return;
    }

    let query = { id: client.UID };
    let updateValue = {};
    if (red) {
        query.red = { $gte: tongTien };
        updateValue.red = -tongTien;
    } else {
        query.xu = { $gte: tongTien };
        updateValue.xu = -tongTien;
    }

    UserInfo.findOneAndUpdate(
        query,
        { $inc: updateValue },
        { new: true, projection: 'red xu daily name' },
        function(err, user) {
            if (!user) {
                client.red({ rongho: { notice: 'Ban khong du tien de cuoc.!!' } });
                return;
            }

            UserHistory.create({
                uid: client.UID,
                name: user.name,
                action: UserHistoryEnums.RONGHO,
                transType: UserHistoryEnums.TRANS_MINUS,
                red: tongTien,
                balance: user.red * 1,
                description: 'cuoc rong ho'
            });

            let rongho = client.redT.rongho;

            RongHo_cuoc.findOne({ uid: client.UID, phien: rongho.phien, red: red }, function(errFind, checkOne) {
                if (checkOne) {
                    checkOne.rong += box.red.rong;
                    checkOne.ho += box.red.ho;
                    checkOne.hoa += box.red.hoa;
                    checkOne.ro += box.red.ro;
                    checkOne.co += box.red.co;
                    checkOne.bich += box.red.bich;
                    checkOne.tep += box.red.tep;
                    checkOne.save();

                    if (tongTien >= 10000) {
                        try {
                            telegram(
                                process.env.TELEGRAM_ALERT_GROUP,
                                `${user.name.toUpperCase()}\n+ vua cuoc tro Rong Ho!!!\n+ so tien: ${helpers.numberWithCommas(tongTien)}\n`
                            );
                        } catch (e) {
                            console.log(e);
                        }
                    }
                } else {
                    let create = { uid: client.UID, name: client.profile.name, phien: rongho.phien, red: red, time: new Date() };
                    create.rong = box.red.rong;
                    create.ho = box.red.ho;
                    create.hoa = box.red.hoa;
                    create.ro = box.red.ro;
                    create.co = box.red.co;
                    create.bich = box.red.bich;
                    create.tep = box.red.tep;
                    RongHo_cuoc.create(create);

                    if (tongTien >= 10000) {
                        try {
                            telegram(
                                process.env.TELEGRAM_ALERT_GROUP,
                                `${user.name.toUpperCase()}\n+ vua cuoc them tro Rong Ho!!!\n+ so tien: ${helpers.numberWithCommas(tongTien)}\n`
                            );
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }

                let newData = {
                    rong: box.red.rong,
                    ho: box.red.ho,
                    hoa: box.red.hoa,
                    ro: box.red.ro,
                    co: box.red.co,
                    bich: box.red.bich,
                    tep: box.red.tep,
                };

                let me_cuoc = {};
                if (red) {
                    rongho.data.red.rong += box.red.rong;
                    rongho.data.red.ho += box.red.ho;
                    rongho.data.red.hoa += box.red.hoa;
                    rongho.data.red.ro += box.red.ro;
                    rongho.data.red.co += box.red.co;
                    rongho.data.red.bich += box.red.bich;
                    rongho.data.red.tep += box.red.tep;

                    rongho.dataAdmin.red.rong += box.red.rong;
                    rongho.dataAdmin.red.ho += box.red.ho;
                    rongho.dataAdmin.red.hoa += box.red.hoa;
                    rongho.dataAdmin.red.ro += box.red.ro;
                    rongho.dataAdmin.red.co += box.red.co;
                    rongho.dataAdmin.red.bich += box.red.bich;
                    rongho.dataAdmin.red.tep += box.red.tep;

                    if (rongho.ingame.red[client.profile.name]) {
                        rongho.ingame.red[client.profile.name].rong += box.red.rong;
                        rongho.ingame.red[client.profile.name].ho += box.red.ho;
                        rongho.ingame.red[client.profile.name].hoa += box.red.hoa;
                        rongho.ingame.red[client.profile.name].ro += box.red.ro;
                        rongho.ingame.red[client.profile.name].co += box.red.co;
                        rongho.ingame.red[client.profile.name].bich += box.red.bich;
                        rongho.ingame.red[client.profile.name].tep += box.red.tep;
                    } else {
                        rongho.ingame.red[client.profile.name] = Object.assign({}, newData);
                    }
                    me_cuoc.red = rongho.ingame.red[client.profile.name];
                } else {
                    rongho.data.xu.rong += box.red.rong;
                    rongho.data.xu.ho += box.red.ho;
                    rongho.data.xu.hoa += box.red.hoa;
                    rongho.data.xu.ro += box.red.ro;
                    rongho.data.xu.co += box.red.co;
                    rongho.data.xu.bich += box.red.bich;
                    rongho.data.xu.tep += box.red.tep;

                    rongho.dataAdmin.xu.rong += box.red.rong;
                    rongho.dataAdmin.xu.ho += box.red.ho;
                    rongho.dataAdmin.xu.hoa += box.red.hoa;
                    rongho.dataAdmin.xu.ro += box.red.ro;
                    rongho.dataAdmin.xu.co += box.red.co;
                    rongho.dataAdmin.xu.bich += box.red.bich;
                    rongho.dataAdmin.xu.tep += box.red.tep;

                    if (rongho.ingame.xu[client.profile.name]) {
                        rongho.ingame.xu[client.profile.name].rong += box.red.rong;
                        rongho.ingame.xu[client.profile.name].ho += box.red.ho;
                        rongho.ingame.xu[client.profile.name].hoa += box.red.hoa;
                        rongho.ingame.xu[client.profile.name].ro += box.red.ro;
                        rongho.ingame.xu[client.profile.name].co += box.red.co;
                        rongho.ingame.xu[client.profile.name].bich += box.red.bich;
                        rongho.ingame.xu[client.profile.name].tep += box.red.tep;
                    } else {
                        rongho.ingame.xu[client.profile.name] = Object.assign({}, newData);
                    }
                    me_cuoc.xu = rongho.ingame.xu[client.profile.name];
                }

                Object.values(rongho.clients).forEach(function(users) {
                    if (client !== users) {
                        users.red({ rongho: { chip: { box: box, cuoc: cuoc } } });
                    } else {
                        users.red({
                            rongho: { mechip: { box: box, cuoc: data.cuoc }, me: me_cuoc },
                            user: { red: user.red, xu: user.xu }
                        });
                    }
                });
            });
        }
    );
};
