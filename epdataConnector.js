'use strict'
const bent = require('bent')
const constants = require('./constants')

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const PAYLOADS = {
    'infected': { Formato: 'json', Guid: 'a3e214f9-bab7-4231-97b8-edbe9d0c85a3', Host: 'wwww.epdata.es' },
    'healed': { Formato: 'json', Guid: '58d0919c-8ad1-4a3f-9255-55f5b116da23', Host: 'wwww.epdata.es' },
	'death': { Formato: 'json', Guid: 'b2568be9-c6b6-4056-86d6-02c6d45b1696', Host: 'wwww.epdata.es' },
	'global': { Formato: 'json', Guid: 'c07ac326-e36d-4af7-9c7a-af5d37d2d944', Host: 'wwww.epdata.es' }
}

module.exports.doInfectedRequest = async () => {
    return this.doRequest(PAYLOADS.infected)
}

module.exports.doHealedRequest = async () => {
    return this.doRequest(PAYLOADS.healed)
}

module.exports.doDeathRequest = async () => {
    return this.doRequest(PAYLOADS.death)
}

module.exports.doGlobalRequest = async() => {
	return this.doRequest(PAYLOADS.global);
}

module.exports.doRequest = async (payload) => {
	const post = bent('POST', 'json', 200);
	const response = await post(constants.EPDATA_URI, payload);
	return JSON.parse(response).Respuesta.Datos.Metricas[0].Datos;
}

module.exports.filterInfoByDate = (covidData) =>
{
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	var todayInfo = [];
	var yesterdayInfo = [];

	covidData.forEach(day => {
		if (day.Parametro.includes(today.getDate() + ' (' + MONTHS[today.getMonth()] + ')'))
			todayInfo = day;
		if (day.Parametro.includes(yesterday.getDate() + ' (' + MONTHS[yesterday.getMonth()] + ')'))
			yesterdayInfo = day;
	});

	//We dont have data from today yet
	if (todayInfo.length == 0) {
		const twoDaysAgo = new Date();
		twoDaysAgo.setDate(today.getDate() - 2);
		covidData.forEach(day => {
			if (day.Parametro.includes(yesterday.getDate() + ' (' + MONTHS[yesterday.getMonth()] + ')'))
				todayInfo = day;
			if (day.Parametro.includes(twoDaysAgo.getDate() + ' (' + MONTHS[twoDaysAgo.getMonth()] + ')'))
				yesterdayInfo = day;
		});
	}
	return { todayInfo, yesterdayInfo };
}