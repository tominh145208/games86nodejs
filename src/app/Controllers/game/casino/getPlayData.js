const TcgService = require('../../../Helpers/TcgService');
const UserInfo = require('../../../Models/UserInfo');

module.exports = (client, data) => {
    if (!data || !data.platform) return;

    try {
        UserInfo.findOne({ id: client.UID }, 'red name', async function(err, user) {
            if (err) {
                console.log(`Casino getPlayData user lookup error: ${err.message}`);
                return client.red({ casino: {} });
            }

            if (!user) {
                console.log('Casino getPlayData user not found');
                return client.red({ casino: {} });
            }

            let platform = 'html5-desktop';
            if (data.platform == 'mobile') {
                platform = 'html5';
            } else if (data.platform == 'desktop') {
                platform = 'html5-desktop';
            }

            const getGame = await TcgService.getLaunchGame(
                user.name,
                TcgService.TcgApiService.productType,
                1,
                'SEX001',
                platform
            );

            if (getGame && getGame.status == 0) {
                return client.red({
                    casino: {
                        playRequest: {
                            url: getGame.game_url,
                        },
                    },
                });
            }

            console.log(`Casino getPlayData service error: ${getGame ? (getGame.error_desc || getGame.status) : 'empty response'}`);
            client.red({ casino: {} });
        });
    } catch (e) {
        console.log(`Casino getPlayData unexpected error: ${e.message}`);
        client.red({ casino: {} });
    }
};
