import Context from './context'

function test(label: string, testCase: any) {
	if (Context.collecting) {
		Context.collectedTests.set(label, testCase)
	}
}

class Expectation {
	value: string

	constructor(value: string) {
		this.value = value
	}

	toEqual(value: string) {
		if (this.value !== value) {
			throw Error('NOT EQUAL')
		}
	}
}

// FIXME: Unknown type, in principle.
function expect(value: string) {
	return new Expectation(value)
}

export { test, expect }
