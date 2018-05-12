const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

describe('getAnnualConsumption()', () => {

	let getAnnualConsumption;
	let mocks;

	beforeEach(() => {
		mocks = {
			// Avoid dependency on specific business config within tests, so e.g. a price change doesn't
			// cause a test fail
			prices: [
				{
					"tariff": "some-energy",
					"rates": {
						"power": 3,
						"gas": 5 // fee per kilowatt hour
					},
					"standing_charge": 10
				}
			],
			vatMultiplier: 1.1
		}

		getAnnualConsumption = proxyquire('../../../src/lib/get-annual-consumption', {
			'../config/prices.json': mocks.prices,
			'../config/vat-multiplier.json': mocks.vatMultiplier,
		});

	});

	it('should return the total annual consumption in kWh, with consideration to VAT and standing charges, rounded to two decimal places', () => {

		// 40 is what you want to spend
		// so 40 with vat taken off is what will actually go towards your bill
		// remove the standing charge to work out how much will actually go towards buying energy at the given rate
		// multiply by 12 to get the annual amount spent on energy at the given rate

		// expectedAnnualConsumption = ( ( ( targetMonthlySpend / vatMultiplier ) - monthlyStandingCharge ) * 12 ) / ratePerKwh
		// expectedAnnualConsumption = ( ( ( 40 / 1.1 ) - 10) * 12) / 5
		const expectedAnnualConsumption = 63.27;

		expect(getAnnualConsumption({
			tariffName: 'some-energy',
			fuelType: 'gas',
			targetMonthlySpend: 40
		}))
			.to.equal(expectedAnnualConsumption);
	});

	it('should throw an error if a non-string tariffName is provided', () => {
		expect(() => getAnnualConsumption({
			tariffName: null,
			fuelType: 'gas',
			targetMonthlySpend: 40
		})).to.throw('Invalid tariff name provided')
	});

	it('should throw an error if a non-string fuelType is provided', () => {
		expect(() => getAnnualConsumption({
			tariffName: 'dsfsdf',
			fuelType: null,
			targetMonthlySpend: 40
		})).to.throw('Invalid fuel type provided')
	});

	it('should throw an error if a non-number targetMonthlySpend is provided', () => {
		expect(() => getAnnualConsumption({
			tariffName: 'dsfsdf',
			fuelType: 'gas',
			targetMonthlySpend: 'lol'
		})).to.throw('Invalid target monthly spend provided: string lol')
	});

	it('should throw an error if a targetMonthlySpend is given as NaN', () => {
		expect(() => getAnnualConsumption({
			tariffName: 'dsfsdf',
			fuelType: 'gas',
			targetMonthlySpend: +'lol'
		})).to.throw('Invalid target monthly spend provided: number NaN')
	});

	it('should throw an error if the tariff name is not found in the prices index', () => {
		expect(() => getAnnualConsumption({
			tariffName: 'whatever',
			fuelType: 'gas',
			targetMonthlySpend: 40
		})).to.throw('No tariff found with name \'whatever\'')
	});

	it('should throw an error if the fuel type is not found against the tariff in the prices index', () => {
		expect(() => getAnnualConsumption({
			tariffName: 'some-energy',
			fuelType: 'nuclear',
			targetMonthlySpend: 40
		})).to.throw('Invalid fuel type \'nuclear\' for tariff with name \'some-energy\'')
	});
});
