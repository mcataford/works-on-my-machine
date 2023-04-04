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
		not: {},
		addMatcher: function (this: any, matcher: any) {
			return (other: unknown) => {
				const out = matcher(this.value, other)

				if (!out.pass) {
					throw new TestAssertionFailed(out.message)
				}
			}
		},
	}
	Object.entries(matchers.matchers).forEach(([label, matcher]) => {
		Object.defineProperty(expectation, label, {
			value: expectation.addMatcher(matcher),
			enumerable: true,
		})

		if (label in matchers.matchersToInverseMap) {
			const reverseMatcherName = matchers.matchersToInverseMap[
				label as keyof typeof matchers.matchersToInverseMap
			] as keyof typeof matchers.inverseMatchers
			Object.defineProperty(expectation.not, label, {
				value: expectation.addMatcher(matchers.inverseMatchers[reverseMatcherName]),
				enumerable: true,
			})
		}
	})

	Object.entries(matchers.inverseMatchers).forEach(([label, matcher]) => {
		Object.defineProperty(expectation, label, {
			value: expectation.addMatcher(matcher),
			enumerable: true,
		})
	})

	return expectation as Expect<ValueType>
}

export default expect
