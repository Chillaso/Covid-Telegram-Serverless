'use strict'

const increment = require('./increment')
const lasthour = require('./lasthour')
const news = require('./news')
const telegramService = require('./telegram')
const constants = require('./constants')

const getMessage = async (command) => {
	switch(command)
	{
		case '/incremento':
			return await increment.getIncrement()
		case '/ultimahora':
			return await lasthour.getLastHour()
		case '/noticias':
			return await news.getNews()
		default:
			return constants.HELP_MESSAGE
	}
}

module.exports.covidApp = async event => 
{
	let telegram = telegramService.getCommand(event)

	await getMessage(telegram.command)
	/*
		Take care with this, because if you don't pass a object reference it crash inside send message
		method. You can check more of this explanation here:
		https://stackoverflow.com/questions/45643005/why-is-this-undefined-in-this-class-method 
		Or just Google for object reference javascript
	*/
	.then(message => telegram.sendMessage(message))
	.then({statusCode: 200})
	.catch(e => {
		console.error(e)
		telegram.sendMessage(constants.ERROR_MESSAGE)
		return {statusCode: 200}
	})

	return {statusCode: 200}
}