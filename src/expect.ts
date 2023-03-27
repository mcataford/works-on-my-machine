import assert from 'assert'

class TestAssertionFailed extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'TestAssertionFailed'
	}
}

// TODO(mcat): This should just be using `assert`
class Expectation<ValueType> {
	value: ValueType

	constructor(value: ValueType) {
		this.value = value
	}

	toEqual(value: ValueType) {
        assert.deepEqual(this.value, value, new TestAssertionFailed(`NotEqual! ${this.value} != ${value}`))
	}

	toBe(value: ValueType) {
		if (Object.is(this.value, value)) return
		throw new TestAssertionFailed(`NotEqual! ${this.value} !== ${value}`)
	}
}

function expect<ValueType>(value: ValueType) {
	return new Expectation(value)
}

export default expect
