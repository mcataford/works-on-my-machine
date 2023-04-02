import { promises as fs } from 'fs'

import expect from './expect'
import { greenText, redText } from './utils'
import { type TestCaseLabel, type TestCaseFunction, type TestCaseGroup } from './types'

function describe(label: TestCaseLabel, testGroup: TestCaseGroup) {
	if (process.env.COLLECT) {
		testGroup()
		return
	}

	console.group(greenText(label))
	testGroup()
	console.groupEnd()
}

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

const it = test

export { it, test, expect, describe }
