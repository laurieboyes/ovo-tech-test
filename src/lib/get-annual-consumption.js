const toTwoDecimalPlaces = require('./util/to-two-decimal-places');
const prices = require('../config/prices.json');
const vatMultiplier = require('../config/vat-multiplier.json');

module.exports = ({ tariffName, fuelType, targetMonthlySpend }) => {

	// I recognise the irony of deciding not to use TypeScript in favour of all of these manual type checks
	if (typeof tariffName !== 'string' || !tariffName.length) {
		throw new Error(`Invalid tarrif name provided: ${tariffName}`);
	}
	if (typeof fuelType !== 'string' || !fuelType.length) {
		throw new Error(`Invalid fuel type provided: ${fuelType}`);
	}
	if (typeof targetMonthlySpend !== 'number') {
		throw new Error(`Invalid target monthly spend provided: ${typeof targetMonthlySpend} ${targetMonthlySpend}`);
	}

	
	const tariffPrice = prices.find(p => p.tariff === tariffName)
	if (!tariffPrice) {
		throw new Error(`No tarrif found with name ${tariffName}`);
	}

	const standingCharge = tariffPrice.standing_charge;

	const ratePerKwh = tariffPrice.rates[fuelType];
	if (!ratePerKwh) {
		throw new Error(`Invalid fuel type ${fuelType} for tarrif with name ${tariffName}`);
	}

	const yearlySpendMinusStandingCharge = (targetMonthlySpend - standingCharge) * 12;
	const kwhAnnually = yearlySpendMinusStandingCharge / ratePerKwh;

	const kwhAnnuallyIncludingVat = kwhAnnually * vatMultiplier;

	return toTwoDecimalPlaces(kwhAnnuallyIncludingVat);
}
