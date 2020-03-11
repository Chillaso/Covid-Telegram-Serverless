'use strict';

const bent = require('bent');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const COVID_DATA_HOSTNAME = 'https://www.epdata.es/';
const COVID_DATA_URI = 'oembed/get/';
const COVID_DATA_PAYLOAD = { Formato: 'json', Guid: 'a3e214f9-bab7-4231-97b8-edbe9d0c85a3', Host: 'wwww.epdata.es' };
const LAST_HOUR_URI = 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=(Confirmed%20%3E%200)%20AND%20(Deaths%3E0)%20AND%20(Country_Region%3D%27Spain%27)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Deaths%20desc%2CCountry_Region%20asc%2CProvince_State%20asc&outSR=102100&resultOffset=0&resultRecordCount=250&cacheHint=true';

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
	var response = await get(LAST_HOUR_URI);
	var info = JSON.parse(response).features[0].attributes;
	var date = new Date(info.Last_Update).toLocaleString();

	return 'Datos actualizados sobre personas contagiadas del coronavirus en España (' + date +'):\n' +
	info.Confirmed + ' - personas infectadas\n' + 
	info.Deaths + ' - personas fallecidas \n' +
	info.Recovered + ' - personas recuperadas\n' + 
	(info.Confirmed - info.Deaths - info.Recovered) + ' - personas activas infectadas';
}

const getSendMessage = async (text) => {
	switch(text)
	{
		case '/incremento' || 'incremento':
			return await getData().then(calcIncrement);
		case '/ultimahora' || 'ultimahora':
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
