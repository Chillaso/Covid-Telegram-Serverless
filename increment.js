'use strict'

const epdata = require('./epdataConnector')

module.exports.getIncrement = async () => {
    return epdata.doInfectedRequest()
    .then(epdata.filterInfoByDate)
    .then(({todayInfo, yesterdayInfo}) => calcIncrement(todayInfo, yesterdayInfo))
    .then(({increment, yesterdayInfo, todayInfo}) => getMessage(increment, yesterdayInfo, todayInfo))
};

const calcIncrement = (todayInfo, yesterdayInfo) => 
{
	let increment = (((todayInfo.Valor - yesterdayInfo.Valor) / yesterdayInfo.Valor) * 100).toFixed(2);
	return { increment, yesterdayInfo, todayInfo };
}

const getDifference = (today, yesterday) => {
    return today - yesterday;
}

const getMessage = (increment, yesterdayInfo, todayInfo) => 
{
    return '\u2623 Los casos de coronavirus han incrementado un: <b>' + increment + '%</b> desde el ' 
        + yesterdayInfo.Parametro + ' hasta el ' + todayInfo.Parametro
        + ' pasando de ' + yesterdayInfo.Valor + ' a ' + todayInfo.Valor + ' afectados. Suponiendo <b>'
        + getDifference(todayInfo.Valor, yesterdayInfo.Valor) + ' nuevos casos durante la jornada actual.</b>\n\n'
        + '<i>Fuente: Ministerio de Sanidad y epdata.es</i>';
}
