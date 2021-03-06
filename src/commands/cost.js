const program = require('commander');
const getAllTariffsAnnualCost = require('../lib/get-all-tariffs-annual-cost');

program
	.arguments('<powerUsage> <gasUsage>')
	.parse(process.argv);

const [powerUsageStr, gasUsageStr] = program.args;
if (!powerUsageStr || !gasUsageStr) {
	program.outputHelp();
	process.exit();
}
const powerUsage = +powerUsageStr;
const gasUsage = +gasUsageStr;

try {
	console.log(`Total annual cost:${'\n'}${
		getAllTariffsAnnualCost({ powerUsage, gasUsage })
			.map(tariff => `${tariff.name} ${tariff.annualCost}`)
			.join('\n')
		}`);
} catch (err) {
	console.log(err.message)
}
