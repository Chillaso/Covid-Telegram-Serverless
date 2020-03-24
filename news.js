'use strict'

const bent = require('bent');
const cheerio = require('cheerio');
const constants = require('./constants')

module.exports.getNews = async () => {
	var get = bent(200, 301);
	const res = await get(constants.COVID_NEWS_URI)
	if(res.statusCode == 200)
	{
		return getBuffer(res)
				.then(toString())
				.then(getMessage)
	}
	else if(res.statusCode == 301)
	{
		console.log('Redirecting to', res.headers.location)
		return get(res.headers.location)
				.then(getBuffer)
				.then(toString())
				.then(getMessage)
	}
}

const getMessage = (html) => 
{
    var message = '\u2757 \u2757 ÚLTIMA HORA \u2757 \u2757 \n\n';
	var {times, events} = getEventsFromHtml(html);

	for (var i = 0; i < constants.MAX_EVENTS; i++) {
		if (isHtmlEventsRight(events, i))
			message += '• ' + times[i] + ' - ' + events[i] + '\n\n';
	}
    message += 'Fuente de datos: <a href="' + constants.COVID_NEWS_URI + '">RTVE.</a>';
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
}

const getBuffer = stream => new Promise((resolve, reject) => {
  const parts = []
  stream.on('error', reject)
  stream.on('end', () => resolve(Buffer.concat(parts)))
  stream.on('data', d => parts.push(d))
})

