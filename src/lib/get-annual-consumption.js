const toTwoDecimalPlaces = require('./util/to-two-decimal-places');
const prices = require('../config/prices.json');
const vatMultiplier = require('../config/vat-multiplier.json');

module.exports = ({ tariffName, fuelType, targetMonthlySpend }) => {

	// I recognise the irony of deciding not to use TypeScript and then doing all of these manual type checks
	if (typeof tariffName !== 'string' || !tariffName.length) {
		throw new Error(`Invalid tariff name provided: ${tariffName}`);
	}
	if (typeof fuelType !== 'string' || !fuelType.length) {
		throw new Error(`Invalid fuel type provided: ${fuelType}`);
	}
	if (isNaN(targetMonthlySpend)) {
		throw new Error(`Invalid target monthly spend provided: ${typeof targetMonthlySpend} ${targetMonthlySpend}`);
	}

	const tariffPrice = prices.find(p => p.tariff === tariffName)
	if (!tariffPrice) {
		throw new Error(`No tariff found with name '${tariffName}'`);
	}

	const monthlyStandingCharge = tariffPrice.standing_charge;

	const ratePerKwh = tariffPrice.rates[fuelType];
	if (!ratePerKwh) {
		throw new Error(`Invalid fuel type '${fuelType}' for tariff with name '${tariffName}'`);
	}

	// say 40 is what you want to spend
	// so 40 with vat taken off is what will actually go towards your bill
	// remove the standing charge to work out how much will actually go towards buying energy at the given rate
	// multiply by 12 to get the annual amount spent on energy at the given rate
	// divide the annual power spend by the rate per kWh to get the annual consumption in kWh

	// annualConsumption = ( ( ( targetMonthlySpend / vatMultiplier ) - monthlyStandingCharge ) * 12 ) / ratePerKwh
	// annualConsumption = ( ( ( 40 / 1.1 ) - 10) * 12) / 5

	const monthlySpendBeforeVat = targetMonthlySpend / vatMultiplier;

	const monthlySpendAfterStandingCharge = monthlySpendBeforeVat - monthlyStandingCharge;
	const annualSpendAfterStandingCharge = monthlySpendAfterStandingCharge * 12;

	const kwhAnnually = annualSpendAfterStandingCharge / ratePerKwh;

	return toTwoDecimalPlaces(kwhAnnually);
}
