'use strict';

const bent = require('bent');

const COVID_DATA_HOSTNAME = 'https://www.epdata.es/';
const COVID_DATA_URI = 'oembed/get/';
const COVID_DATA_PAYLOAD = { Formato: 'json', Guid: 'a3e214f9-bab7-4231-97b8-edbe9d0c85a3', Host: 'wwww.epdata.es' };
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const getData = async () => {
	const post = bent(COVID_DATA_HOSTNAME, 'POST', 'json', 200);
	const response = await post(COVID_DATA_URI, COVID_DATA_PAYLOAD);
	return JSON.parse(response).Respuesta.Datos.Metricas[0].Datos;
}

const calcIncrement = (covidData) => {
	var twoDaysAgo = covidData[covidData.length - 2];
	var yesterday = covidData[covidData.length - 1];
	var increment = (((yesterday.Valor - twoDaysAgo.Valor) / twoDaysAgo.Valor) * 100).toFixed(2);
	return 'Los casos de coronavirus han incrementado un: ' + increment + '% desde el ' + twoDaysAgo.Parametro + ' hasta el ' + yesterday.Parametro 
	+ ' pasando de ' + twoDaysAgo.Valor + ' a ' + yesterday.Valor + ' afectados.';
}

const sendToUser = async (chat_id, text) => 
{
	const get = bent('https://api.telegram.org/', 'GET', 'json', 200);
	const uri = `bot${TELEGRAM_TOKEN}/sendMessage`;
	return await get(uri, {chat_id, text})
}

module.exports.getIncrement = async event => {

	const body = JSON.parse(event.body);
	console.log('Telegram bot body', body);
	const { chat, text } = body.message;
	console.log("Text from telegram", text);
	if (text == '/datos') 
	{
		console.log('Getting covid data...')
		let message = await getData().then(calcIncrement);
		console.log('Message response...', message);

		await sendToUser(chat.id, message);
	}
	else
		await sendToUser(chat.id, "Use /datos para obtener los datos del incremento del coronavirus");

	return { statusCode: 200 };
};
