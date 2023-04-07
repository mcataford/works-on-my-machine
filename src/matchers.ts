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
function toEqual(value: unknown, other: unknown, negated: boolean = false): MatcherReport {
	if (negated) return toNotEqual(value, other)
	const output = { pass: false, message: '' }

	try {
		assert.deepEqual(value, other)
		output.pass = true
	} catch (e) {
		output.message = `${value} != ${other}`
	}

	return output
}

/*
 * Inverse of toEqual.
 */
function toNotEqual(value: unknown, other: unknown, negated: boolean = false): MatcherReport {
	if (negated) return toEqual(value, other)

	const out = toEqual(value, other)

	out.pass = !out.pass
	out.message = out.pass ? '' : `${value} == ${other}`

	return out
}

/*
 * Asserts whether value and other are the same entity.
 */
function toBe(value: unknown, other: unknown, negated: boolean = false): MatcherReport {
	if (negated) return toNotBe(value, other)

	const isSame = Object.is(value, other)
	return { pass: isSame, message: `${value} is not ${other}` }
}

/*
 * Inverse ot toBe.
 */
function toNotBe(value: unknown, other: unknown, negated: boolean = false): MatcherReport {
	if (negated) return toBe(value, other)
	const out = toBe(value, other)

	out.pass = !out.pass
	out.message = out.pass ? '' : `${value} is ${other}`

	return out
}

/*
 * Asserts whether the provided function throws the provided error.
 */
function toThrow(func: () => unknown, negated: boolean = false): MatcherReport {
	if (negated) return toNotThrow(func)

	const report = { pass: false, message: '' }

	try {
		func()
	} catch (e) {
		report.pass = true
	}

	if (!report.pass) {
		report.message = 'Function did not throw'
	}

	return report
}

/*
 * Inverse of toThrow.
 */
function toNotThrow(func: () => unknown, negated: boolean = false): MatcherReport {
	if (negated) return toThrow(func)

	const out = toThrow(func)

	out.pass = !out.pass
	out.message = out.pass ? '' : 'Function threw exception'

	return out
}

export default [toEqual, toBe, toThrow, toNotEqual, toNotBe, toNotThrow]
