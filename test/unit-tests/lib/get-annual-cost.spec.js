const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

describe('getAnnualCost()', () => {

	let getAnnualCost;
	let mocks;

	beforeEach(() => {
		mocks = {
			// Avoid dependency on specific business config within tests, so e.g. a price change doesn't
			// cause a test fail
			prices: [
				{
					"tariff": "energy1",
					"rates": {
						"power": 0.95,
						"gas": 0.52
					},
					"standing_charge": 2.3
				},
				{
					"tariff": "energy2",
					"rates": {
						"power": 0.134,
						"gas": 0.32
					},
					"standing_charge": 5.4
				},
				{
					"tariff": "energy3 (no gas)",
					"rates": {
						"power": 0.52,
					},
					"standing_charge": 8.1
				},
				{
					"tariff": "energy4",
					"rates": {
						"power": 0.35,
						"gas": 0.22
					},
					"standing_charge": 3.6
				}
			],
			vatMultiplier: 1.1
		}

		getAnnualCost = proxyquire('../../../src/lib/get-annual-cost', {
			'../config/prices.json': mocks.prices,
			'../config/vat-multiplier.json': mocks.vatMultiplier,
		});

	});

	it('should return an array of tarrif names and annual costs, inclusive of VAT, sorted by cheapest first', () => {
		expect(getAnnualCost({
			annualPowerUsage: 2000,
			annualGasUsage: 2300
		}))
			.to.deep.equal(
				[
					{
						annualCost: 1246.96,
						name: 'energy2'
					},
					{
						annualCost: 1421.64,
						name: 'energy4'
					},
					{
						annualCost: 3466.32,
						name: 'energy1'
					}
				]
			);
	});


	it('should return tariffs all that supply all energy types the customer is supplied', () => {
		expect(getAnnualCost({
			annualPowerUsage: 2000,
			annualGasUsage: 0 // no gas
		}).map(t => t.name)).to.deep.equal([
			'energy2',
			'energy1',
			'energy3 (no gas)',
			'energy4'
		]);
	});

	it('should not return tariffs that don\'t include all energy types the customer is supplied', () => {
		expect(getAnnualCost({
			annualPowerUsage: 2000,
			annualGasUsage: 2300
		}).map(t => t.name)).to.not.include('energy3 (no gas)');
	});

	it('should throw an error if a non-number annualPowerUsage is provided', () => {
		expect(() => getAnnualCost({
			annualPowerUsage: 'lol',
			annualGasUsage: 2300
		})).to.throw('Invalid power usage provided: string lol')
	});

	it('should throw an error if a non-number annualPowerUsage is given as NaN', () => {
		expect(() => getAnnualCost({
			annualPowerUsage: +'lol',
			annualGasUsage: 2300
		})).to.throw('Invalid power usage provided: number NaN')
	});

	it('should throw an error if a non-number annualGasUsage is provided', () => {
		expect(() => getAnnualCost({
			annualPowerUsage: 234,
			annualGasUsage: 'lol'
		})).to.throw('Invalid gas usage provided: string lol')
	});

	it('should throw an error if a non-number annualGasUsage is given as NaN', () => {
		expect(() => getAnnualCost({
			annualPowerUsage: 234,
			annualGasUsage: +'lol'
		})).to.throw('Invalid gas usage provided: number NaN')
	});

});
