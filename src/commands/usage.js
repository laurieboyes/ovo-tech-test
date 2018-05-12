const program = require('commander');
const getAnnualConsumption = require('../lib/get-annual-consumption');

program
	.arguments('<tariffName> <fuelType> <targetMonthlySpend>')
	.parse(process.argv);

const [tariffName, fuelType, targetMonthlySpendStr] = program.args;
if (!tariffName || !fuelType || !targetMonthlySpendStr) {
	return program.outputHelp();
}
const targetMonthlySpend = +targetMonthlySpendStr

try {
	console.log(`Total annual consumption: ${getAnnualConsumption({ tariffName, fuelType, targetMonthlySpend })}`)
} catch (err) {
	console.log(err.message)
}
