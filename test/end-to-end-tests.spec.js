const { expect } = require('chai');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function getExecutionResults (shellString) {
	const { stdout } = await exec(shellString);
	return stdout.trim();
}

describe('End-to-end tests', () => {

	describe('usage', () => {
		it('should respond with the expected values', async () => {
			expect(await getExecutionResults('dist/usage greener-energy power 40'))
				.to.equal('Total annual consumption: 2313.36');

			expect(await getExecutionResults('dist/usage better-energy gas 25'))
				.to.equal('Total annual consumption: 6449.8');
		});
	});

	describe('cost', () => {
		it('should respond with the expected values', async () => {
			expect(await getExecutionResults('dist/cost 2000 2300'))
				.to.equal('Total annual cost:\n' +
					'better-energy 566.54\n' +
					'2yr-fixed 585.35\n' +
					'simpler-energy 592.87');

			expect(await getExecutionResults('dist/cost 2000 0'))
				.to.equal('Total annual cost:\n' +
					'better-energy 392.03\n' +
					'simpler-energy 403.41\n' +
					'2yr-fixed 403.62\n' +
					'greener-energy 429.2'
				);
		});
	});
});
