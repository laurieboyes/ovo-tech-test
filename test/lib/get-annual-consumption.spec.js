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
						"power": 0.1367,
						"gas": 0.0288 // fee per kilowatt hour
					},
					"standing_charge": 8.33
				}
			],
			vatMultiplier: 1.1
		}

		getAnnualConsumption = proxyquire('../../src/lib/get-annual-consumption', {
			'../config/prices.json': mocks.prices,
			'../config/vat-multiplier.json': mocks.vatMultiplier,
		});

	});

	it('should return the total annual consumption in kWh, inclusive of VAT, rounded to two decimal places', () => {
		expect(getAnnualConsumption({
			tariffName: 'some-energy',
			fuelType: 'gas',
			targetMonthlySpend: 40
		}))
			.to.equal(14515.42);
	});

	it('should throw an error if a non-string tariffName is provided', () => {
		expect(() => getAnnualConsumption({
			tariffName: null,
			fuelType: 'gas',
			targetMonthlySpend: 40
		})).to.throw('Invalid tarrif name provided')
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

	it('should throw an error if the tariff name is not found in the prices index', () => {
		expect(() => getAnnualConsumption({
			tariffName: 'whatever',
			fuelType: 'gas',
			targetMonthlySpend: 40
		})).to.throw('No tarrif found with name whatever')
	});

	it('should throw an error if the fuel type is not found against the tariff in the prices index', () => {
		expect(() => getAnnualConsumption({
			tariffName: 'some-energy',
			fuelType: 'nuclear',
			targetMonthlySpend: 40
		})).to.throw('Invalid fuel type nuclear for tarrif with name some-energy')
	});

	context('when VAT changes', () => {

		beforeEach(() => {
			mocks.vatMultiplier = 1.05

			getAnnualConsumption = proxyquire('../../src/lib/get-annual-consumption', {
				'../config/prices.json': mocks.prices,
				'../config/vat-multiplier.json': mocks.vatMultiplier,
			});
		})
		it('should return different usage reflecting the changed VAT', () => {
			expect(getAnnualConsumption({
				tariffName: 'some-energy',
				fuelType: 'gas',
				targetMonthlySpend: 40
			}))
				.to.equal(13855.63);
		})
	});

	context('when there\'s no standing charge for the tariff', () => { // you never know

		beforeEach(() => {
			mocks.prices.find(p => p.tariff === 'some-energy').standing_charge = 0;

			getAnnualConsumption = proxyquire('../../src/lib/get-annual-consumption', {
				'../config/prices.json': mocks.prices,
				'../config/vat-multiplier.json': mocks.vatMultiplier,
			});
		})
		it('should return increased usage reflecting the reduced rate', () => {
			expect(getAnnualConsumption({
				tariffName: 'some-energy',
				fuelType: 'gas',
				targetMonthlySpend: 40
			}))
				.to.equal(18333.33);
		})
	});
});
