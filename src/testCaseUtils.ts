import Context from './context'

class TestAssertionFailed extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'TestAssertionFailed'
    }
}

function test(label: string, testCase: any) {
	// Hack to get the file that contains the test definition.
	const _prepareStackTrace = Error.prepareStackTrace
	Error.prepareStackTrace = (_, stack) => stack
	const stack = new Error().stack?.slice(1)
	Error.prepareStackTrace = _prepareStackTrace

	const testCaseLocation = String(stack && stack[0]).match(/\(.*\)/)
    const testCaseLoc = testCaseLocation && testCaseLocation[0]

	Context.collectedTests.set(`${testCaseLoc}:${label}`, testCase)
}

class Expectation<ValueType> {
	value: ValueType

	constructor(value: ValueType) {
		this.value = value
	}

	toEqual(value: ValueType) {
        const isPrimitive = ['boolean', 'number'].includes(typeof(value))
        const isString = !isPrimitive && typeof(value) === 'string'

		if ((isPrimitive || isString) && this.value === value) {
			return
		}

        throw new TestAssertionFailed('NotEqual!')
	}
}

function expect<ValueType>(value: ValueType) {
	return new Expectation(value)
}

export { test, expect }
