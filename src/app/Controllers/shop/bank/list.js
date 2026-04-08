var BankHistory = require('../../../Models/Bank/Bank_history');
var Bank = require('../../../Models/Bank/Bank');
let helpers = require('../../../Helpers/Helpers');
const axios = require("axios");


const fallbackAccount = { number: '106882688204', name: 'HO VAN MINH' };

module.exports = async (client) => {
    const buildFallbackList = async () => {
        const buildFromDb = async () => {
            try {
                const dbBanks = await Bank.find({}).lean();
                if (dbBanks && dbBanks.length) {
                    let bankList = [];
                    for (const bank of dbBanks) {
                        let transid = helpers.getRandomInt(100000000, 999999999);
                        let comment = `NAP_${client.UID}_${helpers.makeid(6)}`;
                        try {
                            await BankHistory.create({
                                uid: client.UID,
                                bank: String(bank.bank || '').toUpperCase(),
                                number: bank.number || "",
                                branch: bank.branch || "",
                                name: String(bank.name || '').toUpperCase(),
                                info: comment,
                                hinhthuc: 1,
                                transId: transid,
                                money: 0,
                                status: 3,
                                time: new Date()
                            });
                        } catch (e) {
                            // Ignore DB errors so UI can still display fallback list
                        }
                        bankList.push({
                            bank: String(bank.bank || '').toUpperCase(),
                            number: bank.number || "",
                            name: String(bank.name || '').toUpperCase(),
                            branch: bank.branch || "",
                            content: comment,
                            transid: transid
                        });
                    }
                    return bankList;
                }
            } catch (e) {
                // fall through to static fallback
            }
            return null;
        };

        const dbList = await buildFromDb();
        if (dbList && dbList.length) {
            return dbList;
        }
        const fallbackBanks = [
            { bankName: 'VietinBank', bankCode: 'VIETINBANK', shortName: 'VIETINBANK', number: '106882688204', name: 'HO VAN MINH' },
        ];

        let bankList = [];
        for (const bank of fallbackBanks) {
            let transid = helpers.getRandomInt(100000000, 999999999);
            let comment = `NAP_${client.UID}_${helpers.makeid(6)}`;
            try {
                await BankHistory.create({
                    uid: client.UID,
                    bank: bank.bankName.toUpperCase(),
                    number: bank.number,
                    branch: bank.bankCode,
                    name: bank.name,
                    info: comment,
                    hinhthuc: 1,
                    transId: transid,
                    money: 0,
                    status: 3,
                    time: new Date()
                });
            } catch (e) {
                // Ignore DB errors so UI can still display fallback list
            }
            bankList.push({
                bank: bank.bankName.toUpperCase(),
                number: bank.number,
                name: bank.name,
                branch: bank.shortName.toUpperCase(),
                content: comment,
                transid: transid
            });
        }
        return bankList;
    };

    try {
        const getBankAvailible = await axios({
            method: 'get',
            url: `${config.API_URL}/bank/list?name=${config.NAME}&key=${config.KEY}`,
            headers: {}
        });
        const bankAvailible = getBankAvailible.data;
        let bankList = [];

        if (bankAvailible.isError) {
            const bankList = await buildFallbackList();
            client.red({ shop: { bank: { list: bankList } } });
            return void 0;
        }

        for (var bank of bankAvailible.data) {
            let transid = helpers.getRandomInt(100000000, 999999999);
            let reqBankDetail = null;
            try {
                const bankDetail = await axios({
                    method: 'post',
                    url: `${config.API_URL}/info`,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({
                        "kind": "json",
                        "name": config.NAME,
                        "key": config.KEY,
                        "tranID": transid,
                        "type": "Bank",
                        "bankCode": bank.bankCode,
                        "accessToken": config.TOKEN,
                        "size": 100,
                        "character": client.UID + "_" + helpers.makeid(8),
                        "comment": "WinVip_Create_Transaction"
                    })
                });
                reqBankDetail = bankDetail.data;
            } catch (e) {
                reqBankDetail = null;
            }

            if (!!reqBankDetail) {
                BankHistory.create({
                    uid: client.UID,
                    bank: bank.bankName.toUpperCase(),
                    number: reqBankDetail.numberPhone,
                    branch: bank.bankCode,
                    name: reqBankDetail.name.toUpperCase(),
                    info: reqBankDetail.comment,
                    hinhthuc: 1,
                    transId: reqBankDetail.TranID,
                    money: 0,
                    status: 3,
                    time: new Date()
                });
            
                bankList.push({
                    bank: bank.bankName.toUpperCase(),
                    number: reqBankDetail.numberPhone,
                    name: reqBankDetail.name.toUpperCase(),
                    branch: bank.shortName.toUpperCase(),
                    content: reqBankDetail.comment,
                    transid: reqBankDetail.TranID
                });
            } else {
                let fallbackComment = `NAP_${client.UID}_${helpers.makeid(6)}`;
                try {
                    BankHistory.create({
                        uid: client.UID,
                        bank: bank.bankName.toUpperCase(),
                        number: fallbackAccount.number,
                        branch: bank.bankCode,
                        name: fallbackAccount.name,
                        info: fallbackComment,
                        hinhthuc: 1,
                        transId: transid,
                        money: 0,
                        status: 3,
                        time: new Date()
                    });
                } catch (e) {
                    // Ignore DB errors so UI can still display fallback list
                }
                bankList.push({
                    bank: bank.bankName.toUpperCase(),
                    number: fallbackAccount.number,
                    name: fallbackAccount.name,
                    branch: bank.shortName.toUpperCase(),
                    content: fallbackComment,
                    transid: transid
                });
            }
        
        }
        client.red({ shop: { bank: { list: bankList } } });
    } catch (e) {
        console.log(`Error Bank: ${e.message}`);
        const bankList = await buildFallbackList();
        client.red({ shop: { bank: { list: bankList } } });
    }
}









