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
        const get = bent(200, 400);
        const response = await get(constants.SEND_MESSAGE_URI, {chat_id, text, parse_mode: "HTML"});
        if(response.statusCode == 400)
        {
            console.error('Bad HTML sended to telegram bot')
            text = constants.ERROR_MESSAGE
            get(constants.SEND_MESSAGE_URI, {chat_id, text, parse_mode: "HTML"});
        }
    }
}

module.exports.getCommand = (event) => {
    const { chat, text } = JSON.parse(event.body).message
    return new Telegram(chat.id, text)
}
