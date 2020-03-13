'use strict';

const bent = require('bent');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const COVID_DATA_HOSTNAME = 'https://www.epdata.es/';
const COVID_DATA_URI = 'oembed/get/';
const INFECTED_PAYLOAD = { Formato: 'json', Guid: 'a3e214f9-bab7-4231-97b8-edbe9d0c85a3', Host: 'wwww.epdata.es' };
const HEALED_PAYLOAD = { Formato: 'json', Guid: '58d0919c-8ad1-4a3f-9255-55f5b116da23', Host: 'wwww.epdata.es' };
const DEATH_PAYLOAD = { Formato: 'json', Guid: 'b2568be9-c6b6-4056-86d6-02c6d45b1696', Host: 'wwww.epdata.es' };

//const LAST_HOUR_URI = 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=(Confirmed%20%3E%200)%20AND%20(Deaths%3E0)%20AND%20(Country_Region%3D%27Spain%27)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Deaths%20desc%2CCountry_Region%20asc%2CProvince_State%20asc&outSR=102100&resultOffset=0&resultRecordCount=250&cacheHint=true';

const HELP_MESSAGE = 'Por favor use alguno de los comandos siguientes:\n/incremento - Obtiene el incremento de contagiados respecto al dia anterior' + 
'\n/ultimahora - Obtiene los ultimos datos de personas contagiadas';

const getData = async (payload) => {
	const post = bent(COVID_DATA_HOSTNAME, 'POST', 'json', 200);
	const response = await post(COVID_DATA_URI, payload);
	return JSON.parse(response).Respuesta.Datos.Metricas[0].Datos;
}

const calcIncrement = (covidData) => {

	var { todayInfo, yesterdayInfo } = filterInfoByDate(covidData);

	var increment = (((todayInfo.Valor - yesterdayInfo.Valor) / yesterdayInfo.Valor) * 100).toFixed(2);

	return '\u2623 Los casos de coronavirus han incrementado un: *' + increment + '%* desde el ' + yesterdayInfo.Parametro + ' hasta el ' + todayInfo.Parametro 
	+ ' pasando de ' + yesterdayInfo.Valor + ' a ' + todayInfo.Valor + ' afectados, según fuentes del Ministerio de Sanidad.';
}

const filterInfoByDate = (covidData) =>
{
	const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
		'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	var todayInfo = [];
	var yesterdayInfo = [];

	covidData.forEach(day => {
		if (day.Parametro.includes(today.getDate() + ' (' + months[today.getMonth()] + ')'))
			todayInfo = day;
		if (day.Parametro.includes(yesterday.getDate() + ' (' + months[yesterday.getMonth()] + ')'))
			yesterdayInfo = day;
	});

	//We dont have data from today yet
	if (todayInfo.length == 0) {
		const twoDaysAgo = new Date();
		twoDaysAgo.setDate(yesterday.getDate() - 1);
		covidData.forEach(day => {
			if (day.Parametro.includes(yesterday.getDate() + ' (' + months[yesterday.getMonth()] + ')'))
				todayInfo = day;
			if (day.Parametro.includes(twoDaysAgo.getDate() + ' (' + months[twoDaysAgo.getMonth()] + ')'))
				yesterdayInfo = day;
		});
	}
	return { todayInfo, yesterdayInfo };
}

const getLastHourInfo = async () => {

	var infected = (await getData(INFECTED_PAYLOAD).then(filterInfoByDate)).todayInfo;
	var healed = (await getData(HEALED_PAYLOAD).then(filterInfoByDate)).todayInfo;
	var death = (await getData(DEATH_PAYLOAD).then(filterInfoByDate)).todayInfo;

	return '\u26A0 \u26A0 Datos actualizados sobre personas contagiadas del coronavirus en España (_' + infected.Parametro + '_):\n\n' +
	'\u2623 - *'+ infected.Valor + '* - personas infectadas\n\n' + 
	'\u26B0 - *'+ death.Valor + '* - personas fallecidas\n\n' +
	'\u2705 - *'+ healed.Valor + '* - personas recuperadas\n\n' + 
	'\u2757 - *'+ (infected.Valor - death.Valor - healed.Valor) + '* - personas activas infectadas';
}

const getSendMessage = async (text) => {
	switch(text)
	{
		case '/incremento':
			return await getData(INFECTED_PAYLOAD).then(calcIncrement);
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
	return await get(uri, {chat_id, text, parse_mode: "Markdown"});
}

module.exports.covidApp = async event => {

	const body = JSON.parse(event.body);
	const { chat, text } = body.message;
	let message = await getSendMessage(text);
	await sendToUser(chat.id, message);

	return { statusCode: 200 };
};

