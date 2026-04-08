const TcgService = require('../../../Helpers/TcgService');
const UserInfo = require('../../../Models/UserInfo');

module.exports = (client, data) => {
    if (!data) return;

    try {
        UserInfo.findOne({ id: client.UID }, 'red name', async function(err, user) {
            if (err) {
                console.log(`Casino getBalance user lookup error: ${err.message}`);
                return client.red({ casino: {} });
            }

            if (!user) {
                console.log('Casino getBalance user not found');
                return client.red({ casino: {} });
            }

            const getBalance = await TcgService.getBalance(user.name, TcgService.TcgApiService.productType);
            if (getBalance && getBalance.status == 0) {
                return client.red({ casino: { betBalance: getBalance.balance } });
            }

            console.log(`Casino getBalance service error: ${getBalance ? (getBalance.error_desc || getBalance.status) : 'empty response'}`);
            client.red({ casino: {} });
        });
    } catch (e) {
        console.log(`Casino getBalance unexpected error: ${e.message}`);
        client.red({ casino: {} });
    }
};
