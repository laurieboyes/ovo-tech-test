const program = require('commander');
const getAnnualCost = require('../lib/get-annual-cost');

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
		getAnnualCost({ powerUsage, gasUsage })
			.map(tariff => `${tariff.name} ${tariff.annualCost}`)
			.join('\n')
		}`);
} catch (err) {
	console.log(err.message)
}
