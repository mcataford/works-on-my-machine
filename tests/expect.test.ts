import { test, expect } from '../src/testCaseUtils'

test('Equality (number)', () => {
	expect(1).toEqual(1)
})

test('Equality (string)', () => {
	expect('expectations').toEqual('expectations')
})

test('Equality (boolean)', () => {
	expect(true).toEqual(true)
})

test('Equality (failed - number)', () => {
	try {
		expect(1).toEqual(2)
	} catch (e) {
		expect(1).toEqual(1)
	}
})

test('Equality (failed - string)', () => {
	try {
		expect('expectation').toEqual('something else')
	} catch (e) {
		expect(1).toEqual(1)
	}
})

test('Equality (failed - boolean)', () => {
	try {
		expect(true).toEqual(false)
	} catch (e) {
		expect(1).toEqual(1)
	}
})

test('Identity comparison (number)', () => {
	expect(1).toBe(1)
})

test('Identity comparison (boolean)', () => {
	expect(true).toBe(true)
})

test('Identity comparison (string)', () => {
	expect('identity').toBe('identity')
})

test('Identity comparison (failed - number)', () => {
	try {
		expect(1).toEqual(2)
	} catch (e) {
		expect(1).toEqual(1)
	}
})

test('Identity comparison (failed - boolean)', () => {
	try {
		expect(false).toBe(true)
	} catch (e) {
		expect(1).toEqual(1)
	}
})

test('Identity comparison (failed - string)', () => {
	try {
		expect('yes').toBe('no')
	} catch (e) {
		expect(1).toEqual(1)
	}
})
