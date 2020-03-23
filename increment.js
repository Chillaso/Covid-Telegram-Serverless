'use strict'

const epdata = require('./epdataConnector')
const constants = require('./constants')

module.exports.getIncrement = async () => {
    return epdata.doInfectedRequest()
    .then(epdata.filterInfoByDate)
    .then(({todayInfo, yesterdayInfo}) => calcIncrement(todayInfo, yesterdayInfo))
    .then(({increment, yesterdayInfo, todayInfo}) => getMessage(increment, yesterdayInfo, todayInfo))
    .catch(e => {
        console.error(e);
        return constants.ERROR_MESSAGE
    });
};

const calcIncrement = (todayInfo, yesterdayInfo) => 
{
	let increment = (((todayInfo.Valor - yesterdayInfo.Valor) / yesterdayInfo.Valor) * 100).toFixed(2);
	return { increment, yesterdayInfo, todayInfo };
}

const getMessage = (increment, yesterdayInfo, todayInfo) => 
{
    return '\u2623 Los casos de coronavirus han incrementado un: <b>' + increment + '%</b> desde el ' 
        + yesterdayInfo.Parametro + ' hasta el ' + todayInfo.Parametro
        + ' pasando de ' + yesterdayInfo.Valor + ' a ' + todayInfo.Valor + ' afectados, según fuentes del Ministerio de Sanidad.';
}
