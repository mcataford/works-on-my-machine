/*
 * Built-in matchers
 *
 * All the matchers defined and exported as part of the default export
 * of this file are available to each `expect` statement made in tests.
 *
 * A matcher's inverse is defined by its behaviour when the `negated` flag
 * that is passed to it is truthy.
 */
import assert from 'assert'

import { type MatcherReport, type WithLength } from '../types'

/*
 * `toEqual` asserts whether `value` and `other` are strictly equal.
 *
 * Once registered, it can be used as
 *
 * ```ts
 * expect(value).toEqual(other)
 * ```
 *
 * and in negated form
 *
 * ```ts
 * expect(value).not.toEqual(other)
 * ```
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
 * `toNotEqual` is the inverse of `toEqual` and behaves the same way as
 * `expect(...).not.toEqual(...)`. Negating it behaves like `toEqual`.
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
 * Inverse of toBe.
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

/*
 * Validates that the `value` has a length of `length`. The value provided to `value` should
 * have a defined length (i.e. it can be a string or some sort of iterable).
 */
function toHaveLength(value: unknown, length: unknown, negated: boolean = false): MatcherReport {
	let valueLength = 0

	const typedLength = length as number
	const typedValue = value as WithLength

	if (typeof typedValue === 'string' || typeof typedValue.length === 'number') valueLength = typedValue.length as number
	else if (typeof typedValue.length === 'function') valueLength = typedValue.length()
	else if (typeof typedValue.size === 'number') valueLength = typedValue.size
	else if (typeof typedValue.size === 'function') valueLength = typedValue.size()
	else assert.fail(`${value} does not have a known length.`)

	const pass = (valueLength === typedLength && !negated) || (valueLength !== typedLength && negated)

	if (!negated) {
		return {
			pass,
			message: pass ? '' : `${value} has length ${valueLength}, not ${typedLength}.`,
		}
	}

	return {
		pass,
		message: pass ? '' : `${value} has length ${typedLength}.`,
	}
}

export default [toEqual, toBe, toThrow, toNotEqual, toNotBe, toNotThrow, toHaveLength]
