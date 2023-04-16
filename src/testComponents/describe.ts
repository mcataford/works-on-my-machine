import { promises as fs } from 'fs'
import { performance } from 'perf_hooks'

import { getTestContext, setContext } from '../testContext'
import { type TestCaseLabel, type TestCaseFunction, type TestCaseGroup } from '../types'

/*
 * `describe` facilitates grouping tests together.
 *
 * ```
 * describe('My test group', () => {
 *      test('My first test', ...)
 *
 *      test('My second test', ...)
 * })
 * ```
 */
function describe(label: TestCaseLabel, testGroup: TestCaseGroup) {
	const parentContext = getTestContext()
	const currentContext = parentContext.addChildContext(label)

	setContext(currentContext)

	testGroup()

	setContext(parentContext)

	if (parentContext.isRootContext) {
		parentContext.runTests()
		setContext(null)
	}
}

Object.defineProperty(describe, 'each', {
	value: function (values: Array<unknown>) {
		return (label: TestCaseLabel, testGroup: TestCaseGroup) => {
			values.forEach((value: unknown, index: number) => {
				describe(label.replace(/%s/g, String(value)), () => testGroup(value))
			})
		}
	},
	enumerable: true,
})

type extendedDescribe = typeof describe & { [key: string]: (...args: Array<unknown>) => extendedDescribe }

const extDescribe = describe as extendedDescribe

export default extDescribe
