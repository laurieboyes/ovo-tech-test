const program = require('commander');

program
	.arguments('<tariffName> <fuelType> <targetMonthlySpend>')
	.parse(process.argv);

const [tariffName, fuelType, targetMonthlySpend] = program.args;

if (!tariffName || !fuelType || !targetMonthlySpend) {
	program.outputHelp();
}
