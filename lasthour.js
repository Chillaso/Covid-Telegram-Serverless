'use strict'

const epdata = require('./epdataConnector')
const constants = require('./constants')

module.exports.getLastHour = () => {
    return getLastHourInfo()
    .then(({infected, healed, death}) => getMessage(infected, healed, death))
}

const getLastHourInfo = async () => {

    let infected = (await epdata.doInfectedRequest().then(epdata.filterInfoByDate))
    let healed = (await epdata.doHealedRequest().then(epdata.filterInfoByDate))
    let death = (await epdata.doDeathRequest().then(epdata.filterInfoByDate))

    infected = infected.todayInfo.length == 0 ? infected.yesterdayInfo : infected.todayInfo
    healed = healed.todayInfo.length == 0 ? healed.yesterdayInfo : healed.todayInfo
    death = death.todayInfo.length == 0 ? death.yesterdayInfo : death.todayInfo

    return {infected, healed, death};
}

const getMessage = (infected, healed, death) => {
    if(infected.length != 0 && healed.length != 0 && death.length != 0)
    {
        return '\u26A0 \u26A0 Datos actualizados sobre personas contagiadas del coronavirus en España <i>' + infected.Parametro + '</i>:\n\n' +
            '\u2623 - <b>' + infected.Valor + '</b> - personas infectadas\n\n' +
            '\u26B0 - <b>' + death.Valor + '</b> - personas fallecidas\n\n' +
            '\u2705 - <b>' + healed.Valor + '</b> - personas recuperadas\n\n' +
            '\u2757 - <b>' + (infected.Valor - death.Valor - healed.Valor) + '</b> - personas activas infectadas';
    }
    else
        return constants.ERROR_MESSAGE;
}
