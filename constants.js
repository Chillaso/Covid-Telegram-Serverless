module.exports = {
    SEND_MESSAGE_URI: `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
    EPDATA_URI: 'https://www.epdata.es/oembed/get/',
    COVID_NEWS_URI: 'https://www.rtve.es/noticias/20200429/coronavirus-covid19-curva-mapa-contagios-espana-mundo-noticias-ultima-hora-directo/2012930.shtml',
    MAX_EVENTS: 8,

    ERROR_MESSAGE: 'No se puede obtener los datos en estos momentos. Disculpe las molestias',
    HELP_MESSAGE: 'Por favor use alguno de los comandos siguientes:\n/incremento - Obtiene el incremento de contagiados respecto al dia anterior' + 
    '\n/ultimahora - Obtiene los ultimos datos de personas contagiadas' +
    '\n /noticias - Obtiene las 10 ultimas noticias sobre el coronavirus',
    UNSUPORTED_HTML_TAGS: ['<img', '<span']
};
