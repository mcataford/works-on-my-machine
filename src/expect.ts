import assert from 'assert'

import matchers from './matchers'

class TestAssertionFailed extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'TestAssertionFailed'
	}
}

interface ExpectBase<ValueType> {
	value?: ValueType
	negated?: boolean
	not: ExpectBase<ValueType> & any
	addMatcher: (this: ExpectBase<ValueType> & any, matcher: any) => void
}

type ComparisonMatcher = (value: unknown) => boolean

type Expectation<ValueType> = ExpectBase<ValueType> & { [key: string]: ComparisonMatcher }

function expect<ValueType>(value: ValueType): Expectation<ValueType> {
	const expectation: ExpectBase<ValueType> = {
		value,
		negated: false,
		get not() {
			this.negated = !this.negated
			return this
		},
		addMatcher: function (this: any, matcher: any) {
			return (other: unknown) => {
				const out = matcher(this.value, other)

				if (this.negated) out.pass = !out.pass

				if (!out.pass) {
					throw new TestAssertionFailed(out.stdout)
				}
			}
		},
	}
	Object.entries(matchers).forEach(([label, matcher]) => {
		Object.defineProperty(expectation, label, {
			value: expectation.addMatcher(matcher),
			enumerable: true,
		})
	})

	return expectation as Expectation<ValueType>
}

export default expect
