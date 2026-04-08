var BankHistory = require('../../../Models/Bank/Bank_history');

module.exports = async(client, data) => {
    try {
        if (!!data.amount && !!data.transid) {
            let amount = data.amount >> 0;
            BankHistory.findOne({ transId: data.transid }, '', function(err, bank) {
                if (!!bank) {
                    bank.money = amount;
                    bank.save();
                    client.red({ notice: { title: 'THÃ€NH CÃ”NG', text: 'Gá»­i yÃªu cáº§u náº¡p thÃ nh cÃ´ng...' } });
                } else {
                    client.red({ notice: { title: 'Lá»–I', text: 'KhÃ´ng tÃ¬m tháº¥y yÃªu cáº§u náº¡p trÃªn há»‡ thá»‘ng' } });
                }
            });
        } else {
        client.red({ notice: { title: "LỖI", text: "Hệ thống nạp bank tạm thời không khả dụng.", "load": false } });
        }
    } catch (err) {
        client.red({ notice: { title: "LỖI", text: "Hệ thống nạp bank tạm thời không khả dụng.", "load": false } });
        console.log(err.message);
    }
}

