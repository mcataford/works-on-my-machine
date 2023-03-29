import assert from 'assert'

class TestAssertionFailed extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'TestAssertionFailed'
	}
}

class Expectation<ValueType> {
	value: ValueType
	negated: boolean

	constructor(value: ValueType) {
		this.value = value
		this.negated = false
	}

	/*
	 * Negates the expectation.
	 */
	get not() {
		this.negated = !this.negated
		return this
	}

	toEqual(value: ValueType) {
		if (this.negated) {
			assert.notDeepEqual(this.value, value, new TestAssertionFailed(`Equal! ${this.value} = ${value}`))
		} else {
			assert.deepEqual(this.value, value, new TestAssertionFailed(`NotEqual! ${this.value} != ${value}`))
		}
	}

	toBe(value: ValueType) {
		const isSame = Object.is(this.value, value)

		if ((isSame && !this.negated) || (!isSame && this.negated)) return
		throw new TestAssertionFailed(`NotEqual! ${this.value} ${this.negated ? '===' : '!=='} ${value}`)
	}
}

function expect<ValueType>(value: ValueType) {
	return new Expectation(value)
}

export default expect
