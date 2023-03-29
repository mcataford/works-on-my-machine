import assert from 'assert'
import { test, expect } from '../src/testCaseUtils'

test('Equality (number)', () => {
	assert.doesNotThrow(() => expect(1).toEqual(1))
})

test('Equality (string)', () => {
	assert.doesNotThrow(() => expect('expectations').toEqual('expectations'))
})

test('Equality (boolean)', () => {
	assert.doesNotThrow(() => expect(true).toEqual(true))
})

test('Equality (failed - number)', () => {
	assert.throws(() => expect(1).toEqual(2))
})

test('Equality (failed - string)', () => {
	assert.throws(() => expect('expectation').toEqual('something else'))
})

test('Equality (failed - boolean)', () => {
	assert.throws(() => expect(true).toEqual(false))
})

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

test('Stacked equality negation', () => {
	assert.doesNotThrow(() => expect('yes').not.not.toEqual('yes'))
})

test('Identity negation', () => {
	assert.doesNotThrow(() => expect('yes').not.toBe('no'))
})

test('Identity negation (fail)', () => {
	assert.throws(() => expect('yes').not.toBe('yes'))
})
