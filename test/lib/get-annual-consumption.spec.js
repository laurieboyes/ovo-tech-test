const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

// Avoid dependency on specific business config within tests, so e.g. a price change doesn't
// cause a test fail
const mockPrices = [
	{
		"tariff": "some-energy",
		"rates": {
			"power": 0.1367,
			"gas": 0.0288
		},
		"standing_charge": 8.33
	},
	{
		"tariff": "some-other-energy",
		"rates": {
			"power": 0.1397,
			"gas": 0.0296
		},
		"standing_charge": 8.75
	}
]

const getAnnualConsumption = proxyquire('../../src/lib/get-annual-consumption', {
	'../config/prices.json': mockPrices
});

describe('getAnnualConsumption()', () => {

	it('should do a thing', () => {
		expect(getAnnualConsumption())
			.to.equal('lol');
	});
});
