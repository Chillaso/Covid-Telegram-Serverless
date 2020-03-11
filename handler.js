'use strict';

const bent = require('bent');
const cheerio = require('cheerio');

const COVID_DATA_HOSTNAME = 'https://www.epdata.es/';
const COVID_DATA_URI = 'oembed/get/';
const COVID_DATA_PAYLOAD = { Formato: 'json', Guid: 'a3e214f9-bab7-4231-97b8-edbe9d0c85a3', Host: 'wwww.epdata.es' };
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const HELP_MESSAGE = 'Por favor use alguno de los comandos siguientes:\n/incremento - Obtiene el incremento de contagiados respecto al dia anterior' + 
'\n/ultimahora - Obtiene los ultimos datos de personas contagiadas';

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

const getLastHourInfo = async () => {
	var get = bent('string');
	var html = await get('http://www.mscbs.gob.es/profesionales/saludPublica/ccayes/alertasActual/nCov-China/situacionActual.htm');
	
	var $ = cheerio.load(html);
	var infected = $('.banner-coronavirus p.cifra');
	var lastUpdatedHour = $($('section.col-sm-8.col-md-9.informacion div.imagen_texto')).children().first().text();

	let infectedSpain = infected.eq(0).text();
	let infectedEurope = infected.eq(1).text();
	let infectedWorld = infected.eq(2).text();

	return 'Ultima hora datos actualizados sobre personas contagiadas del coronavirus (' + lastUpdatedHour +'):\n'
	+ 'España - ' + infectedSpain + ' infectados\n'
	+ 'Europa - ' + infectedEurope + ' infectados \n'
	+ 'Mundo - ' + infectedWorld + ' infectados';
}

const getSendMessage = async (text) => {
	switch(text)
	{
		case '/incremento':
			return await getData().then(calcIncrement);
		case '/ultimahora':
			return await getLastHourInfo();
		default:
			return HELP_MESSAGE;
	}
}

const sendToUser = async (chat_id, text) => 
{
	const get = bent('https://api.telegram.org/', 'GET', 'json', 200);
	const uri = `bot${TELEGRAM_TOKEN}/sendMessage`;
	return await get(uri, {chat_id, text})
}

module.exports.covidApp = async event => {

	const body = JSON.parse(event.body);
	const { chat, text } = body.message;

	let message = await getSendMessage(text);
	//console.log('Sending Message...', message);
	await sendToUser(chat.id, message);

	return { statusCode: 200 };
};
