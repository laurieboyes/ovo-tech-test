const vatMultiplier = require('../config/vat-multiplier.json');
const toTwoDecimalPlaces = require('./util/to-two-decimal-places');

module.exports = ({ monthlyStandingCharge, powerRate, gasRate, powerUsage, gasUsage, discountMultiplier}) => {

	// I recognise the irony of deciding not to use TypeScript and then doing all of these manual type checks
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
	// todo discountMultiplier validation

	const annualPowerCost = powerRate * powerUsage;
	const annualGasCost = gasRate * gasUsage;

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

	const validatedDiscountMultiplier = discountMultiplier || 1;

	const annualCost = annualCostExcludingVat * validatedDiscountMultiplier * vatMultiplier;

	return toTwoDecimalPlaces(annualCost);
}
