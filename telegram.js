'use strict'

const bent = require('bent')
const constants = require('./constants')

class Telegram {

    constructor(chatId, command) {
        this.chatId = chatId
        this.command = command
    }

    async sendMessage(text) {
        let chat_id = this.chatId
        const get = bent('GET', 'json', 200);
        const uri = `https://api.telegram.org/bot${constants.TELEGRAM_TOKEN}/sendMessage`;
        return get(uri, {chat_id, text, parse_mode: "HTML"});
    }
}

module.exports.getCommand = (event) => {
    const { chat, text } = JSON.parse(event.body).message
    return new Telegram(chat.id, text)
}
