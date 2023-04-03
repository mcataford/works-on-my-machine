import assert from 'assert'

interface MatcherReport {
	pass: boolean
	stdout: string
}

function toEqual(value: unknown, other: unknown): MatcherReport {
	const output = { pass: false, stdout: '' }

	try {
		assert.deepEqual(value, other)
		output.pass = true
	} catch (e) {
		output.stdout = String(e)
	}

	return output
}

function toBe(value: unknown, other: unknown): MatcherReport {
	const isSame = Object.is(value, other)
	return { pass: isSame, stdout: '' }
}

function toThrow(func: () => unknown, error: Error): MatcherReport {
	const report = { pass: false, stdout: '' }

	try {
		func()
	} catch (e) {
		report.pass = true
	}

	return report
}

export default { toEqual, toBe, toThrow }
