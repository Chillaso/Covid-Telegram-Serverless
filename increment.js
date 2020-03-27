'use strict'

const epdata = require('./epdataConnector')

module.exports.getIncrement = async () => {
    const { increment, todayInfo, yesterdayInfo } = await epdata.doInfectedRequest()
                                                            .then(epdata.filterInfoByDate)
                                                            .then(({todayInfo, yesterdayInfo}) => calcIncrement(todayInfo, yesterdayInfo));
    const globalPercentage = await epdata.doGlobalRequest()
                                 .then(epdata.filterInfoByDate)
                                 .then(global => calcGlobalPercentage(todayInfo.Valor, global.todayInfo.Valor));

    return getMessage(increment, yesterdayInfo, todayInfo, globalPercentage);
};

const calcIncrement = (todayInfo, yesterdayInfo) => 
{
	let increment = (((todayInfo.Valor - yesterdayInfo.Valor) / yesterdayInfo.Valor) * 100).toFixed(2);
	return { increment, yesterdayInfo, todayInfo };
}

const getDifference = (today, yesterday) => {
    return today - yesterday;
}

const calcGlobalPercentage = (localInfect, globalInfect) => {
    console.log(globalInfect);
    
    return ((localInfect / globalInfect) * 100).toFixed(2);
}

const getMessage = (increment, yesterdayInfo, todayInfo, globalCases) => 
{
    return '\u2623 Los casos de coronavirus han incrementado un: <b>' + increment + '%</b> desde el ' 
        + yesterdayInfo.Parametro + ' hasta el ' + todayInfo.Parametro
        + ' pasando de ' + yesterdayInfo.Valor + ' a ' + todayInfo.Valor + ' afectados. Suponiendo <b>'
        + getDifference(todayInfo.Valor, yesterdayInfo.Valor) + ' nuevos casos durante la jornada actual.</b>\n\n'
        + 'Y representando los casos locales el <b>' + globalCases + '% total de casos de todo el mundo.</b>\n\n'
        + '<i>Fuente: Ministerio de Sanidad y epdata.es</i>';
}
