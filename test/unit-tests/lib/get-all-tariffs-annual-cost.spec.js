const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('getAllTariffsAnnualCost()', () => {

	let getAllTariffsAnnualCost;
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
				},
				{
					"tariff": "energy5 (no power)",
					"rates": {
						"gas": 0.22
					},
					"standing_charge": 3.6
				}
			],
			getTariffAnnualCost: sinon.stub()
		}

		mocks.getTariffAnnualCost.onCall(0).returns(7);
		mocks.getTariffAnnualCost.onCall(1).returns(2);
		mocks.getTariffAnnualCost.onCall(2).returns(9);
		mocks.getTariffAnnualCost.onCall(3).returns(5);

		getAllTariffsAnnualCost = proxyquire('../../../src/lib/get-all-tariffs-annual-cost', {
			'../config/prices.json': mocks.prices,
			'./get-tariff-annual-cost': mocks.getTariffAnnualCost,
		});

	});

	it('should return an array of applicable tariff names and annual costs, sorted by cheapest first', () => {
		expect(getAllTariffsAnnualCost({
			powerUsage: 2000,
			gasUsage: 2300
		}))
			.to.deep.equal(
				[
					{
						annualCost: 2,
						name: 'energy2'
					},
					{
						annualCost: 7,
						name: 'energy1'
					},
					{
						annualCost: 9,
						name: 'energy4'
					}
				]
			);
	});


	it('should return all tariffs that cater to power when there is only power usage, regardless of whether or not the tariff caters for gas', () => {
		expect(getAllTariffsAnnualCost({
			powerUsage: 2000,
			gasUsage: 0 // no gas
		})).to.deep.equal([
			{
				annualCost: 2,
				name: 'energy2'
			},
			{
				annualCost: 5,
				name: 'energy4'
			},
			{
				annualCost: 7,
				name: 'energy1'
			},
			{
				annualCost: 9,
				name: 'energy3 (no gas)'
			}
		]);
	});

	it('should not return tariffs that don\'t cater for gas if the usage includes gas', () => {
		expect(getAllTariffsAnnualCost({
			powerUsage: 2000,
			gasUsage: 2300
		}).map(t => t.name)).to.not.include('energy3 (no gas)');
	});

	it('should return all tariffs that cater to gas when there is only gas usage, regardless of whether or not the tariff caters for power', () => {
		expect(getAllTariffsAnnualCost({
			powerUsage: 0, // no power
			gasUsage: 2300 
		})).to.deep.equal([
			{
				annualCost: 2,
				name: 'energy2'
			},
			{
				annualCost: 5,
				name: 'energy5 (no power)'
			},
			{
				annualCost: 7,
				name: 'energy1'
			},
			{
				annualCost: 9,
				name: 'energy4'
			}
		]);
	});

	it('should not return tariffs that don\'t cater for power if the usage includes power', () => {
		expect(getAllTariffsAnnualCost({
			powerUsage: 2000,
			gasUsage: 2300
		}).map(t => t.name)).to.not.include('energy5 (no power)');
	});

	it('should throw an error if a non-number powerUsage is provided', () => {
		expect(() => getAllTariffsAnnualCost({
			powerUsage: 'lol',
			gasUsage: 2300
		})).to.throw('Invalid power usage provided: string lol')
	});

	it('should throw an error if a non-number powerUsage is given as NaN', () => {
		expect(() => getAllTariffsAnnualCost({
			powerUsage: +'lol',
			gasUsage: 2300
		})).to.throw('Invalid power usage provided: number NaN')
	});

	it('should throw an error if a non-number gasUsage is provided', () => {
		expect(() => getAllTariffsAnnualCost({
			powerUsage: 234,
			gasUsage: 'lol'
		})).to.throw('Invalid gas usage provided: string lol')
	});

	it('should throw an error if a non-number gasUsage is given as NaN', () => {
		expect(() => getAllTariffsAnnualCost({
			powerUsage: 234,
			gasUsage: +'lol'
		})).to.throw('Invalid gas usage provided: number NaN')
	});

});
