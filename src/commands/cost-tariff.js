const program = require('commander');
const getAllTariffsAnnualCost = require('../lib/get-all-tariffs-annual-cost');

program
	.arguments('<tariff-name> <power-cost> <gas-cost> <standing-charge> <power-usage> <gas-usage>')
	.parse(process.argv);

const [tariffName, powerCostStr, gasCostStr, standingChargeStr, powerUsageStr, gasUsageStr] = program.args;
if (!powerUsageStr || !gasUsageStr) {
	program.outputHelp();
	process.exit();
}
// todo cast to numbers in a better way?
const standingCharge = +standingChargeStr;
const powerUsage = +powerUsageStr;
const gasUsage = +gasUsageStr;

const additionalTariffs = [
	{
		tariff: tariffName,
		rates: {
			power: +powerCostStr,
			gas: +gasCostStr
		},
		standing_charge: +standingChargeStr
	}
]

try {
	console.log(`Total annual cost:${'\n'}${
		getAllTariffsAnnualCost({ powerUsage, gasUsage, additionalTariffs })
			.map(tariff => `${tariff.name} ${tariff.annualCost}`)
			.join('\n')
		}`);
} catch (err) {
	console.log(err.message)
}
