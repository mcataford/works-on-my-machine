import assert from 'assert'
import { describe, test, expect } from '../src'

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

	test('Equality negation', () => {
		assert.doesNotThrow(() => expect('yes').not.toEqual('no'))
	})
})

describe('Identity', () => {
	test.each([1, true, 'identity'])('Identity comparison (value=%s)', (value: unknown) => {
		assert.doesNotThrow(() => expect(value).toBe(value))
	})

	test.each([
		[1, 2],
		[false, true],
		['yes', 'no'],
	])('Identity comparison (failed - value=%s)', (...pair: Array<unknown>) => {
		assert.throws(() => expect(pair[0]).toBe(pair[1]))
	})

	test('Identity negation', () => {
		assert.doesNotThrow(() => expect('yes').not.toBe('no'))
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
