import { promises as fs } from 'fs'

import { greenText, redText } from './utils'
import { type TestCaseLabel, type TestCaseFunction, type TestCaseGroup } from './types'

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

	console.group(greenText(label))
	testGroup()
	console.groupEnd()
}

Object.defineProperty(describe, 'each', {
	value: function (values: Array<unknown>) {
		return (label: TestCaseLabel, testGroup: TestCaseGroup) => {
			values.forEach((value: unknown, index: number) => {
				describe(`${label}_${index}`, () => testGroup(value))
			})
		}
	},
	enumerable: true,
})

type extendedDescribe = typeof describe & { [key: string]: (...args: Array<unknown>) => extendedDescribe }

const extDescribe = describe as extendedDescribe

export default extDescribe
