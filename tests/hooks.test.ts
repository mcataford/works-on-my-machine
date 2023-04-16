import assert from 'assert'

import { test, describe, beforeEach, afterEach, expect } from 'works-on-my-machine'

describe('Test group lifecycle hooks', () => {
	let outer: boolean = false

	beforeEach(() => {
		outer = true
	})

	afterEach(() => {
		outer = false
	})

	describe('beforeEach', () => {
		let inner: boolean = false

		beforeEach(() => {
			inner = true
		})

		afterEach(() => {
			inner = false
		})

		test('all beforeEach side-effects run before each test runs', () => {
			expect(inner).toBe(true)
			expect(outer).toBe(true)
		})
	})
})
