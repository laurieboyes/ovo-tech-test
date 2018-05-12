const toTwoDecimalPlaces = require('./util/to-two-decimal-places');
const prices = require('../config/prices.json');
const vatMultiplier = require('../config/vat-multiplier.json');

module.exports = ({ annualPowerUsage, annualGasUsage }) => {

	// I recognise the irony of deciding not to use TypeScript in favour of all of these manual type checks
	if (isNaN(annualPowerUsage)) {
		throw new Error(`Invalid power usage provided: ${typeof annualPowerUsage} ${annualPowerUsage}`);
	}
	if (isNaN(annualGasUsage)) {
		throw new Error(`Invalid gas usage provided: ${typeof annualGasUsage} ${annualGasUsage}`);
	}

	return prices

		// filter tariffs that don't cater to usage
		.filter(tariff => (
			(annualPowerUsage === 0 || Boolean(tariff.rates.power)) &&
			(annualGasUsage === 0 || Boolean(tariff.rates.gas))
		))

		.map(tariff => {
			const annualPowerCost = tariff.rates.power * annualPowerUsage;
			const annualGasCost = tariff.rates.gas * annualGasUsage;

			// only include standing charge for fuel type customer is being supplied for
			const annualPowerStandingCharge = annualPowerUsage > 0 ? tariff.standing_charge * 12 : 0;
			const annualGasStandingCharge = annualGasUsage > 0 ? tariff.standing_charge * 12 : 0;

			const annualCostExcludingVat = (
				annualPowerCost +
				annualGasCost +
				annualPowerStandingCharge +
				annualGasStandingCharge
			);

			const annualCost = annualCostExcludingVat * vatMultiplier;

			return {
				name: tariff.tariff,
				annualCost: toTwoDecimalPlaces(annualCost)
			};
		})

		// sort in ascending order of cost
		.sort((a, b) => {
			return a.annualCost - b.annualCost;
		});
}
