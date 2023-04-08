import { promises as fs } from 'fs'

import { greenText, redText } from './utils'
import { type TestCaseLabel, type TestCaseFunction, type TestCaseGroup } from './types'

/*
 * `test` defines a single test case.
 *
 * ```
 * test('My test', () => {
 *    // Assert things.
 * })
 * ```
 */
function test(label: TestCaseLabel, testCase: TestCaseFunction): void {
	if (process.env.COLLECT) {
		console.log(label)
		return
	}

	try {
		testCase()
		console.log(greenText(`[PASSED] ${label}`))
	} catch (e) {
		console.group(redText(`[FAILED] ${label}`))
		console.log(redText(String(e)))
		console.groupEnd()
	}
}

Object.defineProperty(test, 'each', {
	value: function (values: Array<unknown>) {
		return (label: TestCaseLabel, testCase: TestCaseFunction) => {
			values.forEach((value: unknown, index: number) => {
				test(label.replace(/%s/g, String(value)), () => testCase(value))
			})
		}
	},
	enumerable: true,
})

type extendedTest = typeof test & { [key: string]: (...args: Array<unknown>) => extendedTest }

const extTest = test as extendedTest

/*
 * `it` is an alias of `test`.
 */
const it = extTest

export { it }

export default extTest
