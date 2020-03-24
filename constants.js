module.exports = {
    SEND_MESSAGE_URI: `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
    EPDATA_URI: 'https://www.epdata.es/oembed/get/',
    COVID_NEWS_URI: 'https://www.rtve.es/noticias/20200324/coronavirus-ultima-hora/2008165.shtml',
    MAX_EVENTS: 10,

    ERROR_MESSAGE: 'No se puede obtener los datos en estos momentos. Disculpe las molestias',
    HELP_MESSAGE: 'Por favor use alguno de los comandos siguientes:\n/incremento - Obtiene el incremento de contagiados respecto al dia anterior' + 
    '\n/ultimahora - Obtiene los ultimos datos de personas contagiadas' +
    '\n /noticias - Obtiene las 10 ultimas noticias sobre el coronavirus'
};