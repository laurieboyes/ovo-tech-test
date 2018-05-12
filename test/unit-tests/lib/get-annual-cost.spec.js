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

	it('should return an array of applicable tariff names and annual costs, inclusive of VAT, sorted by cheapest first', () => {
		expect(getAnnualCost({
			powerUsage: 2000,
			gasUsage: 2300
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


	it('should return tariffs that only cater to power if the customer has no gas usage', () => {
		expect(getAnnualCost({
			powerUsage: 2000,
			gasUsage: 0 // no gas
		})).to.deep.equal([
			{
				annualCost: 366.08,
				name: 'energy2'
			},
			{
				annualCost: 817.52,
				name: 'energy4'
			},
			{
				annualCost: 1250.92,
				name: 'energy3 (no gas)'
			},
			{
				annualCost: 2120.36,
				name: 'energy1'
			}
		]);
	});

	it('should not return tariffs that don\'t include all energy types the customer is supplied', () => {
		expect(getAnnualCost({
			powerUsage: 2000,
			gasUsage: 2300
		}).map(t => t.name)).to.not.include('energy3 (no gas)');
	});

	it('should throw an error if a non-number powerUsage is provided', () => {
		expect(() => getAnnualCost({
			powerUsage: 'lol',
			gasUsage: 2300
		})).to.throw('Invalid power usage provided: string lol')
	});

	it('should throw an error if a non-number powerUsage is given as NaN', () => {
		expect(() => getAnnualCost({
			powerUsage: +'lol',
			gasUsage: 2300
		})).to.throw('Invalid power usage provided: number NaN')
	});

	it('should throw an error if a non-number gasUsage is provided', () => {
		expect(() => getAnnualCost({
			powerUsage: 234,
			gasUsage: 'lol'
		})).to.throw('Invalid gas usage provided: string lol')
	});

	it('should throw an error if a non-number gasUsage is given as NaN', () => {
		expect(() => getAnnualCost({
			powerUsage: 234,
			gasUsage: +'lol'
		})).to.throw('Invalid gas usage provided: number NaN')
	});

	context('when VAT changes', () => {

		beforeEach(() => {
			mocks.vatMultiplier = 1.05

			getAnnualCost = proxyquire('../../../src/lib/get-annual-cost', {
				'../config/prices.json': mocks.prices,
				'../config/vat-multiplier.json': mocks.vatMultiplier,
			});
		})
		it('should return different annual costs, reflecting the changed VAT', () => {
			expect(getAnnualCost({
				powerUsage: 2000,
				gasUsage: 2300
			}))
				.to.deep.equal(
					[
						{
							annualCost: 1190.28,
							name: 'energy2'
						},
						{
							annualCost: 1357.02,
							name: 'energy4'
						},
						{
							annualCost: 3308.76,
							name: 'energy1'
						}
					]
				);
		})
	});

	context('when there\'s no standing charge for one of the tariffs', () => { // you never know

		beforeEach(() => {
			mocks.prices.find(p => p.tariff === 'energy4').standing_charge = 0;

			getAnnualCost = proxyquire('../../../src/lib/get-annual-cost', {
				'../config/prices.json': mocks.prices,
				'../config/vat-multiplier.json': mocks.vatMultiplier,
			});
		})
		it('should reduce the annual cost for that tariff', () => {
			expect(getAnnualCost({
				powerUsage: 2000,
				gasUsage: 2300
			}))
				.to.deep.equal(
					[
						{
							annualCost: 1246.96,
							name: 'energy2'
						},
						{
							annualCost: 1326.6,
							name: 'energy4'
						},
						{
							annualCost: 3466.32,
							name: 'energy1'
						}
					]
				);
		})
	});

});
