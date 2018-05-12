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
				.to.equal('Total annual consumption: 2584.47');

			expect(await getExecutionResults('dist/usage better-energy gas 25'))
				.to.equal('Total annual consumption: 7293.13');
		});
	});
});
