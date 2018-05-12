const prices = require('../config/prices.json');
const getTariffAnnualCost = require('./get-tariff-annual-cost');

module.exports = ({ powerUsage, gasUsage }) => {

	// I recognise the irony of deciding not to use TypeScript in favour of all of these manual type checks
	if (isNaN(powerUsage)) {
		throw new Error(`Invalid power usage provided: ${typeof powerUsage} ${powerUsage}`);
	}
	if (isNaN(gasUsage)) {
		throw new Error(`Invalid gas usage provided: ${typeof gasUsage} ${gasUsage}`);
	}

	return prices

		// filter out tariffs that don't cater to usage
		.filter(tariff => {
			if(powerUsage > 0 && !tariff.rates.power) {
				return false;
			}
			if(gasUsage > 0 && !tariff.rates.gas) {
				return false;
			}
			return true
		})

		.map(tariff => ({
			name: tariff.tariff,
			annualCost: getTariffAnnualCost({
				monthlyStandingCharge: tariff.standing_charge,
				powerRate: tariff.rates.power || 0,
				gasRate: tariff.rates.gas || 0,
				powerUsage,
				gasUsage
			})
		}))

		// sort in ascending order of cost
		.sort((a, b) => {
			return a.annualCost - b.annualCost;
		});
}
