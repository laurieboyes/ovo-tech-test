const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

// Avoid dependency on specific business config within tests, so e.g. a price change doesn't
// cause a test fail
const mockPrices = [
	{
		"tariff": "some-energy",
		"rates": {
			"power": 0.1367,
			"gas": 0.0288 // fee per kilowatt hour
		},
		"standing_charge": 8.33
	},
	{
		"tariff": "some-no-standing-charge-energy",
		"rates": {
			"power": 0.1397,
			"gas": 0.0296
		},
		"standing_charge": 8.75
	}
]

// Possibly edging _slightly_ towards overkill by mocking VAT as well but I think it's worthwhile
const mockVatMultiplier = 1.1;

const getAnnualConsumption = proxyquire('../../src/lib/get-annual-consumption', {
	'../config/prices.json': mockPrices,
	'../config/vat-multiplier.json': mockVatMultiplier,
});

describe('getAnnualConsumption()', () => {
	it('should return the total annual consumption in kWh, inclusive of VAT, rounded to two decimal places', () => {
		expect(getAnnualConsumption({
			tariffName: 'some-energy',
			fuelType: 'gas',
			targetMonthlySpend: 40
		}))
			.to.equal(14515.42);
	});
});
