import assert from 'assert'

import { type ExpectBase, type Expect } from './types'
import matchers from './matchers'

class TestAssertionFailed extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'TestAssertionFailed'
	}
}

function expect<ValueType>(value: ValueType): Expect<ValueType> {
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
					throw new TestAssertionFailed(out.message)
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

	return expectation as Expect<ValueType>
}

export default expect
