'use strict'

const epdata = require('./epdataConnector')

module.exports.getLastHour = () => {
    return getLastHourInfo()
    .then(({infected, healed, death}) => getMessage(infected, healed, death))
}

const getLastHourInfo = async () => {

	var infected = (await epdata.doInfectedRequest().then(epdata.filterInfoByDate)).todayInfo;
	var healed = (await epdata.doHealedRequest().then(epdata.filterInfoByDate)).todayInfo;
	var death = (await epdata.doDeathRequest().then(epdata.filterInfoByDate)).todayInfo;

    return {infected, healed, death};
}

const getMessage = (infected, healed, death) => {
    return '\u26A0 \u26A0 Datos actualizados sobre personas contagiadas del coronavirus en España <i>' + infected.Parametro + '</i>:\n\n' +
        '\u2623 - <b>' + infected.Valor + '</b> - personas infectadas\n\n' +
        '\u26B0 - <b>' + death.Valor + '</b> - personas fallecidas\n\n' +
        '\u2705 - <b>' + healed.Valor + '</b> - personas recuperadas\n\n' +
        '\u2757 - <b>' + (infected.Valor - death.Valor - healed.Valor) + '</b> - personas activas infectadas';
}
