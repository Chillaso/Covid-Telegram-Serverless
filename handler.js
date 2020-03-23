'use strict';

const bent = require('bent');
const cheerio = require('cheerio');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const COVID_DATA_HOSTNAME = 'https://www.epdata.es/';
const COVID_DATA_URI = 'oembed/get/';
const COVID_NEWS_URI = 'https://www.rtve.es/noticias/20200323/coronavirus-ultima-hora/2008165.shtml';

const INFECTED_PAYLOAD = { Formato: 'json', Guid: 'a3e214f9-bab7-4231-97b8-edbe9d0c85a3', Host: 'wwww.epdata.es' };
const HEALED_PAYLOAD = { Formato: 'json', Guid: '58d0919c-8ad1-4a3f-9255-55f5b116da23', Host: 'wwww.epdata.es' };
const DEATH_PAYLOAD = { Formato: 'json', Guid: 'b2568be9-c6b6-4056-86d6-02c6d45b1696', Host: 'wwww.epdata.es' };

const HELP_MESSAGE = 'Por favor use alguno de los comandos siguientes:\n/incremento - Obtiene el incremento de contagiados respecto al dia anterior' + 
'\n/ultimahora - Obtiene los ultimos datos de personas contagiadas' +
'\n /noticias - Obtiene las 10 ultimas noticias sobre el coronavirus';

const getData = async (payload) => {
	const post = bent(COVID_DATA_HOSTNAME, 'POST', 'json', 200);
	const response = await post(COVID_DATA_URI, payload);
	return JSON.parse(response).Respuesta.Datos.Metricas[0].Datos;
}

const calcIncrement = (covidData) => {

	var { todayInfo, yesterdayInfo } = filterInfoByDate(covidData);

	var increment = (((todayInfo.Valor - yesterdayInfo.Valor) / yesterdayInfo.Valor) * 100).toFixed(2);

	return '\u2623 Los casos de coronavirus han incrementado un: <b>' + increment + '%</b> desde el ' + yesterdayInfo.Parametro + ' hasta el ' + todayInfo.Parametro 
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

	return '\u26A0 \u26A0 Datos actualizados sobre personas contagiadas del coronavirus en España <i>' + infected.Parametro + '</i>:\n\n' +
	'\u2623 - <b>'+ infected.Valor + '</b> - personas infectadas\n\n' + 
	'\u26B0 - <b>'+ death.Valor + '</b> - personas fallecidas\n\n' +
	'\u2705 - <b>'+ healed.Valor + '</b> - personas recuperadas\n\n' + 
	'\u2757 - <b>'+ (infected.Valor - death.Valor - healed.Valor) + '</b> - personas activas infectadas';
}

const getNews = async () => {
	var get = bent('string', 200);
	return get(COVID_NEWS_URI)
			.then(processHtmlIntoMessage)
			.catch(tryNewsRequest);
};

const processHtmlIntoMessage = (html) => {
	var message = '\u2757 \u2757 ÚLTIMA HORA \u2757 \u2757 \n\n';
	var $ = cheerio.load(html);
	var times = [];
	var events = [];
	$('.eventos li.evento span.time').each((i, element) => {
		times.push($(element).text());
	});
	$('.eventos li.evento .texto').each((i, element) => {
		var event = '';
		$(element).find('p').each((i, paragraph) => {
			event += $(paragraph).html() + '\n';
		});
		if (event != '')
			events.push(event);
	});
	for (var i = 0; i < 10; i++) {
		if (isHtmlEventsRight(events, i))
			message += '• ' + times[i] + ' - ' + events[i] + '\n\n';
	}
	message += 'Fuente de datos: <a href="' + COVID_NEWS_URI + '">RTVE.</a>';
	return message;
};

const isHtmlEventsRight = (events, index) => {
	if(events[index] != undefined)
	{
		//TODO: Rethink this method to get consistent information and dont lose parity time - news
		if(events[index].indexOf('<img') == -1)
			return true;
		else if(index < 10)
			isHtmlEventsRight(events, index + 1);
		else
			return false;
	}
	else
		return false;
};

const tryNewsRequest = (res) => {
	var get = bent('string', 200);
	if(res.statusCode == 301)
	{
		console.log(res.headers.location);
		return get(res.headers.location)
			.then(processHtmlIntoMessage)
			.catch(console.log);
	}
	else
		return 'No hay noticias disponibles.';
};

const getMessage = async (text) => {
	switch(text)
	{
		case '/incremento':
			return await getData(INFECTED_PAYLOAD).then(calcIncrement);
		case '/ultimahora':
			return await getLastHourInfo();
		case '/noticias':
			return await getNews();
		default:
			return HELP_MESSAGE;
	}
}

const sendToUser = async (chat_id, text) => 
{
	const get = bent('https://api.telegram.org/', 'GET', 'json', 200);
	const uri = `bot${TELEGRAM_TOKEN}/sendMessage`;
	await get(uri, {chat_id, text, parse_mode: "HTML"});
}

module.exports.covidApp = async event => 
{
	const body = JSON.parse(event.body);
	const { chat, text } = body.message;
	let message = await getMessage(text);
	await sendToUser(chat.id, message);
	return { statusCode: 200 };
};