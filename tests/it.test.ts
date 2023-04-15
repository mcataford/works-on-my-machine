import assert from 'assert'

import { it, test, expect, describe } from 'works-on-my-machine'

describe.each([it, test])('Runs tests', (fn: unknown) => {
	const testFn = fn as typeof test
	testFn('Runs a test', () => {
		assert.doesNotThrow(() => expect(1).toEqual(1))
	})

	testFn.each([1, 2, 3])('Supports parametrization (value=%s)', (value: unknown) => {
		assert.doesNotThrow(() => expect(value).toEqual(value))
	})
})
