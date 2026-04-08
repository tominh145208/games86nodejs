let TXBotChat = require('../Models/TaiXiu_bot_chat');
const fs = require('fs')

module.exports = async(status) => {
    if (!status) return;
    try {
        let allText = fs.readFileSync(process.cwd() + '/src/data/dataFiles/contentBot.txt', 'utf8');
        const dataText = [...new Set(allText.split(/\r?\n/).map(content => (content || '').trim()).filter(Boolean))];
        await TXBotChat.deleteMany({});
        for (const content of dataText) {
            await TXBotChat.create({ 'Content': content });
            console.log(`init bot chat: ${content}`);
        };
    } catch (e) {
        console.log(`Err Init Content BotChat: ${e.message}`);
    }
}
