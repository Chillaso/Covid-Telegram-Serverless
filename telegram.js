'use strict'

const bent = require('bent')
const constants = require('./constants')
const utils = require('./utils')

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
            let error = await utils.getBuffer(response).then(JSON.parse)
            console.error(error.error_code, error.description)
            text = constants.ERROR_MESSAGE
            await get(constants.SEND_MESSAGE_URI, {chat_id, text, parse_mode: "HTML"});
        }
    }
}

module.exports.getCommand = (event) => {
    const { chat, text } = JSON.parse(event.body).message
    return new Telegram(chat.id, text)
}
