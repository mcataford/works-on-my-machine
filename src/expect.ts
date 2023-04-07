import assert from 'assert'

import {
	type Matcher,
	type NoArgMatcher,
	type ComparisonMatcher,
	type RawMatcher,
	type RawNoArgMatcher,
	type RawComparisonMatcher,
	type ExpectWithMatchers,
	type RawMatchersMap,
} from './types'
import matchers from './matchers'

class TestAssertionFailed extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'TestAssertionFailed'
	}
}

class Expect<ValueType> {
	static rawMatchers: RawMatchersMap = { comparisonMatchers: [], noArgMatchers: [] }

	value: unknown
	not: { [key: string]: Matcher }

	/*
	 * Registers matchers with Expect. At this point, Expect knows of them, but
	 * still needs to prepare them on instantiation so they can be used.
	 */
	static addMatcher(matcher: RawMatcher) {
		if (matcher.length == 1) Expect.rawMatchers.noArgMatchers.push(matcher as RawNoArgMatcher)
		else Expect.rawMatchers.comparisonMatchers.push(matcher as RawComparisonMatcher)
	}

	prepareMatcher(matcher: RawMatcher): Matcher {
		if (matcher.length === 1) {
			return (() => {
				const out = (matcher as RawNoArgMatcher)(this.value)

				if (!out.pass) {
					throw new TestAssertionFailed(out.message)
				}
			}) as NoArgMatcher
		} else if (matcher.length === 2) {
			return ((other: unknown) => {
				const out = (matcher as RawComparisonMatcher)(this.value, other)

				if (!out.pass) {
					throw new TestAssertionFailed(out.message)
				}
			}) as ComparisonMatcher
		}

		throw Error('Unknown matcher layout')
	}

	constructor(value: ValueType) {
		this.value = value
		this.not = {}

		Expect.rawMatchers.comparisonMatchers.forEach((matcher: RawMatcher) => {
			const reverseMatcher = matchers.matchersToInverseMap[matcher.name as keyof typeof matchers.matchersToInverseMap]
			Object.defineProperty(this, matcher.name, {
				value: this.prepareMatcher(matcher) as ComparisonMatcher,
				enumerable: true,
			})

			Object.defineProperty(this.not, matcher.name, {
				value: this.prepareMatcher(reverseMatcher) as ComparisonMatcher,
				enumerable: true,
			})
		})

		Expect.rawMatchers.noArgMatchers.forEach((matcher: RawNoArgMatcher) => {
			const reverseMatcher = matchers.matchersToInverseMap[matcher.name as keyof typeof matchers.matchersToInverseMap]
			Object.defineProperty(this, matcher.name, {
				value: this.prepareMatcher(matcher) as NoArgMatcher,
				enumerable: true,
			})

			Object.defineProperty(this.not, matcher.name, {
				value: this.prepareMatcher(reverseMatcher) as NoArgMatcher,
				enumerable: true,
			})
		})
	}
}

export default (() => {
	Object.entries(matchers.matchers).forEach(([label, matcher]) => {
		Expect.addMatcher(matcher)
	})

	Object.entries(matchers.inverseMatchers).forEach(([label, matcher]) => {
		Expect.addMatcher(matcher)
	})

	function expect<ValueType>(value: ValueType): ExpectWithMatchers<ValueType> {
		return new Expect<ValueType>(value) as ExpectWithMatchers<ValueType>
	}

	return expect
})()
