class TestAssertionFailed extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'TestAssertionFailed'
	}
}

class Expectation<ValueType> {
	value: ValueType

	constructor(value: ValueType) {
		this.value = value
	}

	toEqual(value: ValueType) {
		const isPrimitive = ['boolean', 'number'].includes(typeof value)
		const isString = !isPrimitive && typeof value === 'string'

		if ((isPrimitive || isString) && this.value === value) {
			return
		}

		throw new TestAssertionFailed(`NotEqual! ${this.value} != ${value}`)
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
