'use strict'

const bent = require('bent');
const cheerio = require('cheerio');
const constants = require('./constants')
const utils = require('./utils.js')

module.exports.getNews = async () => {
	var get = bent(200, 301);
	const res = await get(constants.COVID_NEWS_URI)
	if(res.statusCode == 200)
	{
		return await utils.getBuffer(res)
					.then(toString())
					.then(getMessage)
	}
	else if(res.statusCode == 301)
	{
		console.log('Redirecting to', res.headers.location)
		return get(res.headers.location)
				.then(async data => await utils.getBuffer(data))
				.then(toString())
				.then(getMessage)
	}
}

const getMessage = (html) => 
{
	var message = '\u2757 \u2757 ÚLTIMA HORA \u2757 \u2757 \n\n';

	var {times, events} = getEventsFromHtml(html);
	var {filteredTimes, filteredEvents} = filterAvailableNews(times, events);

	for (var i = 0; i < filteredTimes.length; i++) {
		message += '• ' + filteredTimes[i] + ' - ' + filteredEvents[i] + '\n\n';
	}

    message += '<i>Fuente de datos: <a href="' + constants.COVID_NEWS_URI + '">RTVE.</a></i>';
	return message;
}

const getEventsFromHtml = (html) => {
    var times = []
    var events = []

    var $ = cheerio.load(html);
    $('.eventos li.evento span.time').each((i, element) => {
        times.push($(element).text().trim());
    });
    $('.eventos li.evento .texto').each((i, element) => {
        var event = '';
        $(element).find('p').each((i, paragraph) => {
            event += $(paragraph).html() + '\n';
        });
        if (event != '')
            events.push(event);
    });
    return {times, events}
}

const filterAvailableNews = (times, events) => {
	const filteredTimes = [];
	const filteredEvents = [];
	const maxSize = getMaxSizeCanLoop(times, events);
	for(var i = 0; i < maxSize; i++)
	{
		if(filteredTimes.length == constants.MAX_EVENTS)
			break;

		if(isHtmlEventsRight(events[i])) 
		{
			filteredTimes.push(times[i]);
			filteredEvents.push(events[i]);
		}
	}
	return {filteredTimes, filteredEvents};
}

const getMaxSizeCanLoop = (times, events) => {
	let maxSize = 0;
	if(times.length > events.length)
		maxSize = events.length
	else if(times.length < events.length)
		maxSize = times.length
	else
		maxSize = events.length
	return maxSize;
}

const isHtmlEventsRight = (event) => 
{
	for (const tag of constants.UNSUPORTED_HTML_TAGS)
	{
		if(event.indexOf(tag) != -1)
			return false;
	}
	return true;
}