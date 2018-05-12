const toTwoDecimalPlaces = require('./util/to-two-decimal-places');
const prices = require('../config/prices.json');
const vatMultiplier = require('../config/vat-multiplier.json');

module.exports = ({ powerUsage, gasUsage }) => {

	// I recognise the irony of deciding not to use TypeScript in favour of all of these manual type checks
	if (isNaN(powerUsage)) {
		throw new Error(`Invalid power usage provided: ${typeof powerUsage} ${powerUsage}`);
	}
	if (isNaN(gasUsage)) {
		throw new Error(`Invalid gas usage provided: ${typeof gasUsage} ${gasUsage}`);
	}

	return prices

		// filter tariffs that don't cater to usage
		.filter(tariff => (
			(powerUsage === 0 || Boolean(tariff.rates.power)) &&
			(gasUsage === 0 || Boolean(tariff.rates.gas))
		))

		.map(tariff => {

			// safe to default these to 0 due to the filtering above
			const annualPowerCost = powerUsage > 0 ? tariff.rates.power * powerUsage : 0;
			const annualGasCost = gasUsage > 0 ? tariff.rates.gas * gasUsage : 0;

			// only include standing charge for fuel type customer is being supplied for
			const annualPowerStandingCharge = powerUsage > 0 ? tariff.standing_charge * 12 : 0;
			const annualGasStandingCharge = gasUsage > 0 ? tariff.standing_charge * 12 : 0;

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
