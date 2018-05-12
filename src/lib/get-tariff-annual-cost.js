const vatMultiplier = require('../config/vat-multiplier.json');
const toTwoDecimalPlaces = require('./util/to-two-decimal-places');

module.exports = ({ monthlyStandingCharge, powerRate, gasRate, powerUsage, gasUsage }) => {

	// I recognise the irony in deciding not to use TypeScript in favour of all of these manual type checks
	if (isNaN(monthlyStandingCharge)) {
		throw new Error(`Invalid monthlyStandingCharge provided: ${typeof monthlyStandingCharge} ${monthlyStandingCharge}`);
	}
	if (isNaN(powerRate)) {
		throw new Error(`Invalid powerRate provided: ${typeof powerRate} ${powerRate}`);
	}
	if (isNaN(gasRate)) {
		throw new Error(`Invalid gasRate provided: ${typeof gasRate} ${gasRate}`);
	}
	if (isNaN(powerUsage)) {
		throw new Error(`Invalid powerUsage provided: ${typeof powerUsage} ${powerUsage}`);
	}
	if (isNaN(gasUsage)) {
		throw new Error(`Invalid gasUsage provided: ${typeof gasUsage} ${gasUsage}`);
	}

	const annualPowerCost = powerUsage > 0 ? powerRate * powerUsage : 0;
	const annualGasCost = gasUsage > 0 ? gasRate * gasUsage : 0;

	// include standing charge for each fuel type customer is being supplied for
	const annualStandingCharge = (
		(powerUsage > 0 ? monthlyStandingCharge : 0) +
		(gasUsage > 0 ? monthlyStandingCharge : 0)
	) * 12

	const annualCostExcludingVat = (
		annualPowerCost +
		annualGasCost +
		annualStandingCharge
	);

	const annualCost = annualCostExcludingVat * vatMultiplier;

	return toTwoDecimalPlaces(annualCost);
}
