import assert from 'assert'
import { describe, test, expect } from '../src'

type ArbitraryValue = string | number | boolean

describe('Equality', () => {
	test.each([1, 'expectations', true])('Equality (value=%s)', (value: unknown) => {
		assert.doesNotThrow(() => expect(value).toEqual(value))
	})

	test.each([
		[1, 2],
		['expectation', 'something else'],
		[true, false],
	])('Equality (failed - values=%s)', (...pair: Array<unknown>) => {
		assert.throws(() => expect(pair[0]).toEqual(pair[1]))
	})
})

describe('Identity', () => {
	test('Identity comparison (number)', () => {
		assert.doesNotThrow(() => expect(1).toBe(1))
	})

	test('Identity comparison (boolean)', () => {
		assert.doesNotThrow(() => expect(true).toBe(true))
	})

	test('Identity comparison (string)', () => {
		assert.doesNotThrow(() => expect('identity').toBe('identity'))
	})

	test('Identity comparison (failed - number)', () => {
		assert.throws(() => expect(1).toEqual(2))
	})

	test('Identity comparison (failed - boolean)', () => {
		assert.throws(() => expect(false).toBe(true))
	})

	test('Identity comparison (failed - string)', () => {
		assert.throws(() => expect('yes').toBe('no'))
	})

	test('Equality negation', () => {
		assert.doesNotThrow(() => expect('yes').not.toEqual('no'))
	})
})

describe('Exception expectation', () => {
	test('Expects error', () => {
		const err = new Error('err')
		expect(() => {
			throw err
		}).toThrow()
	})

	test('Expects no error', () => {
		expect(() => {}).not.toThrow()
	})
})

test('Identity negation', () => {
	assert.doesNotThrow(() => expect('yes').not.toBe('no'))
})

test('Identity negation (fail)', () => {
	assert.throws(() => expect('yes').not.toBe('yes'))
})
