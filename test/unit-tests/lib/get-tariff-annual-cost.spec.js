const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

describe('getTariffAnnualCost()', () => {

	let getTariffAnnualCost;
	let mocks;

	beforeEach(() => {
		mocks = {
			vatMultiplier: 1.1
		}

		getTariffAnnualCost = proxyquire('../../../src/lib/get-tariff-annual-cost', {
			'../config/vat-multiplier.json': mocks.vatMultiplier,
		});
	});

	it('should calculate the annual cost given tariff and usage info', () => {

		// (assuming gas and power provided)
		// expectedAnnualCost = ( (powerUsage * powerRate) + (gasUsage * gasRate) + (monthlyStandingCharge * 12 * 2) ) * vatMultiplier
		// expectedAnnualCost = ( (60 * 3) + (200 * 5) + (10 * 2 * 12) ) * 1.1
		const expectedAnnualCost = 1562;

		expect(getTariffAnnualCost({
			monthlyStandingCharge: 10,
			powerRate: 3,
			gasRate: 5,
			powerUsage: 60,
			gasUsage: 200
		})).to.equal(expectedAnnualCost)
	})

	it('should calculate the annual cost given tariff and usage info if the usage of gas is 0', () => {

		// expectedAnnualCost = ( (powerUsage * powerRate) + (gasUsage * gasRate) + (monthlyStandingCharge * 12 * 1) ) * vatMultiplier
		// expectedAnnualCost = ( (60 * 3) + (0 * 5) + (10 * 1 * 12) ) * 1.1
		const expectedAnnualCost = 330;

		expect(getTariffAnnualCost({
			monthlyStandingCharge: 10,
			powerRate: 3,
			gasRate: 5,
			powerUsage: 60,
			gasUsage: 0
		})).to.equal(expectedAnnualCost)
	})

	it('should calculate the annual cost given tariff and usage info if the usage of power is 0', () => {

		// expectedAnnualCost = ( (powerUsage * powerRate) + (gasUsage * gasRate) + (monthlyStandingCharge * 12 * 1) ) * vatMultiplier
		// expectedAnnualCost = ( (0 * 3) + (200 * 5) + (10 * 1 * 12) ) * 1.1
		const expectedAnnualCost = 1232;

		expect(getTariffAnnualCost({
			monthlyStandingCharge: 10,
			powerRate: 3,
			gasRate: 5,
			powerUsage: 0,
			gasUsage: 200
		})).to.equal(expectedAnnualCost)
	})

	it('should round to 2 decimal places', () => {
		expect(getTariffAnnualCost({
			monthlyStandingCharge: 10.1111,
			powerRate: 3,
			gasRate: 5,
			powerUsage: 60,
			gasUsage: 200
		})).to.equal(1564.93)
	})

	it('should apply a discount where it exists', () => {
		// (assuming gas and power provided)
		// expectedAnnualCost = ( (powerUsage * powerRate) + (gasUsage * gasRate) + (monthlyStandingCharge * 12 * 2) ) * discountMultiplier * vatMultiplier
		// expectedAnnualCost = ( (60 * 3) + (200 * 5) + (10 * 2 * 12) ) * 0.8 * 1.1
		const expectedAnnualCost = 1249.6;

		expect(getTariffAnnualCost({
			monthlyStandingCharge: 10,
			powerRate: 3,
			gasRate: 5,
			powerUsage: 60,
			gasUsage: 200,
			discountMultiplier: 0.8
		})).to.equal(expectedAnnualCost)
	})

	describe('parameter validation', () => {
		it('should throw an error if a non-number monthlyStandingCharge is provided', () => {
			expect(() => getTariffAnnualCost({
				monthlyStandingCharge: 'lol',
				powerRate: 3,
				gasRate: 5,
				powerUsage: 60,
				gasUsage: 200
			})).to.throw('Invalid monthlyStandingCharge provided: string lol')
		});

		it('should throw an error if a non-number monthlyStandingCharge is given as NaN', () => {
			expect(() => getTariffAnnualCost({
				monthlyStandingCharge: +'lol',
				powerRate: 3,
				gasRate: 5,
				powerUsage: 60,
				gasUsage: 200
			})).to.throw('Invalid monthlyStandingCharge provided: number NaN')
		});

		it('should throw an error if a non-number powerRate is provided', () => {
			expect(() => getTariffAnnualCost({
				monthlyStandingCharge: 4,
				powerRate: 'lol',
				gasRate: 5,
				powerUsage: 60,
				gasUsage: 200
			})).to.throw('Invalid powerRate provided: string lol')
		});

		it('should throw an error if a non-number powerRate is given as NaN', () => {
			expect(() => getTariffAnnualCost({
				monthlyStandingCharge: 5,
				powerRate: +'lol',
				gasRate: 5,
				powerUsage: 60,
				gasUsage: 200
			})).to.throw('Invalid powerRate provided: number NaN')
		});

		it('should throw an error if a non-number gasRate is provided', () => {
			expect(() => getTariffAnnualCost({
				monthlyStandingCharge: 4,
				powerRate: 5,
				gasRate: 'lol',
				powerUsage: 60,
				gasUsage: 200
			})).to.throw('Invalid gasRate provided: string lol')
		});

		it('should throw an error if a non-number gasRate is given as NaN', () => {
			expect(() => getTariffAnnualCost({
				monthlyStandingCharge: 5,
				powerRate: 6,
				gasRate: +'lol',
				powerUsage: 60,
				gasUsage: 200
			})).to.throw('Invalid gasRate provided: number NaN')
		});

		it('should throw an error if a non-number powerUsage is provided', () => {
			expect(() => getTariffAnnualCost({
				monthlyStandingCharge: 4,
				powerRate: 5,
				gasRate: 3,
				powerUsage: 'lol',
				gasUsage: 200
			})).to.throw('Invalid powerUsage provided: string lol')
		});

		it('should throw an error if a non-number powerUsage is given as NaN', () => {
			expect(() => getTariffAnnualCost({
				monthlyStandingCharge: 5,
				powerRate: 6,
				gasRate: 3,
				powerUsage: +'lol',
				gasUsage: 200
			})).to.throw('Invalid powerUsage provided: number NaN')
		});

		it('should throw an error if a non-number gasUsage is provided', () => {
			expect(() => getTariffAnnualCost({
				monthlyStandingCharge: 4,
				powerRate: 5,
				gasRate: 3,
				powerUsage: 43,
				gasUsage: 'lol'
			})).to.throw('Invalid gasUsage provided: string lol')
		});

		it('should throw an error if a non-number gasUsage is given as NaN', () => {
			expect(() => getTariffAnnualCost({
				monthlyStandingCharge: 5,
				powerRate: 6,
				gasRate: 3,
				powerUsage: 300,
				gasUsage: +'lol',
			})).to.throw('Invalid gasUsage provided: number NaN')
		});
	});
});
