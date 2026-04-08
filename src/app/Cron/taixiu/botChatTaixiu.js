let TXBotChat = require('../../Models/TaiXiu_bot_chat');
let Helpers = require('../../Helpers/Helpers');

let botchat = function(io) {
    botChat = setInterval(function() {
        let botListChat = Array.isArray(io.listBot) ? io.listBot : [];
        if (botListChat.length < 1) {
            return;
        }
        Helpers.shuffle(botListChat);

        TXBotChat.aggregate([{ $sample: { size: 1 } }]).exec(function(err, chatText) {
            try {
                if (err || !Array.isArray(chatText) || !chatText[0] || !chatText[0].Content) {
                    return;
                }
                let botName = botListChat[0].name || 'nguoichoi99';
                let message = chatText[0].Content;
                Object.values(io.users).forEach(function(users) {
                    users.forEach(function(client) {
                        try {
                            var content = { taixiu: { chat: { message: { user: botName, value: message } } } };
                            client.red(content);
                        } catch (e) {}
                    });
                });
            } catch (e) {}
        });
    }, 4500);
    return botChat;
}



module.exports = async(io) => {
    try {
        botchat(io);
    } catch (e) {
        console.log(e.message);
    }
}
