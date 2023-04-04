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
	const output = { pass: false, message: '' }

	try {
		assert.deepEqual(value, other)
		output.pass = true
	} catch (e) {
		output.message = `${value} != ${other}`
	}

	return output
}

function toNotEqual(value: unknown, other: unknown): MatcherReport {
	const out = toEqual(value, other)

	out.pass = !out.pass
	out.message = out.pass ? '' : `${value} == ${other}`

	return out
}

/*
 * Asserts whether value and other are the same entity.
 */
function toBe(value: unknown, other: unknown): MatcherReport {
	const isSame = Object.is(value, other)
	return { pass: isSame, message: `${value} is not ${other}` }
}

function toNotBe(value: unknown, other: unknown): MatcherReport {
	const out = toBe(value, other)

	out.pass = !out.pass
	out.message = out.pass ? '' : `${value} is ${other}`

	return out
}

/*
 * Asserts whether the provided function throws the provided error.
 */
function toThrow(func: () => unknown, error: Error): MatcherReport {
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

function toNotThrow(func: () => unknown, error: Error): MatcherReport {
	const out = toThrow(func, error)

	out.pass = !out.pass
	out.message = out.pass ? '' : 'Function threw exception'

	return out
}

const matchers = { toEqual, toBe, toThrow }
const inverseMatchers = { toNotEqual, toNotBe, toNotThrow }
const matchersToInverseMap = { toEqual: 'toNotEqual', toBe: 'toNotBe', toThrow: 'toNotThrow' }
export default { matchers, inverseMatchers, matchersToInverseMap }
