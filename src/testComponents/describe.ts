import { promises as fs } from 'fs'
import { performance } from 'perf_hooks'

import { getTestContext, setContext, TestContextExperimental } from '../testContext'
import { greenText, redText } from '../utils'
import { type TestContext, type TestCaseLabel, type TestCaseFunction, type TestCaseGroup } from '../types'

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
	if (process.env.COLLECT) {
		testGroup()
		return
	}

	const context = getTestContext()

	const newContext = new TestContextExperimental(context)

	context.children.push(newContext)

	setContext(newContext)

	console.log(greenText(label))
	testGroup()

	setContext(context)

	if (context.parentContext === null) {
		context.runTests()
	}

	context.children = []
	context.tests.clear()
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
