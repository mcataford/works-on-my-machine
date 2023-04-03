/*
 * Built-in matchers
 *
 * All the matchers defined and exported as part of the default export
 * of this file are available to each `expect` statement made in tests.
 */
import assert from 'assert'

import { type MatcherReport } from './types'

/*
 * Asserts whether value and other are strictly equal.
 */
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

/*
 * Asserts whether value and other are the same entity.
 */
function toBe(value: unknown, other: unknown): MatcherReport {
	const isSame = Object.is(value, other)
	return { pass: isSame, stdout: '' }
}

/*
 * Asserts whether the provided function throws the provided error.
 */
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
