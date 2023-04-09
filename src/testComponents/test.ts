import { promises as fs } from 'fs'
import { performance } from 'perf_hooks'
import { greenText, redText } from '../utils'
import { type TestCaseLabel, type TestCaseFunction, type TestCaseGroup } from '../types'

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
	performance.mark(`test-${label}:start`)
	if (process.env.COLLECT) {
		console.log(label)
		return
	}

	let hasFailed = false
	try {
		testCase()
	} catch (e) {
		hasFailed = true
		console.log(redText(String(e)))
	}
	performance.mark(`test-${label}:end`)
	const testDuration = performance.measure(`test-${label}`, `test-${label}:start`, `test-${label}:end`).duration

	if (hasFailed) console.log(redText(`❌ [FAILED] ${label} (${(testDuration / 1000).toFixed(3)}s)`))
	else console.log(greenText(`✅ [PASS] ${label} (${(testDuration / 1000).toFixed(3)}s)`))
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
