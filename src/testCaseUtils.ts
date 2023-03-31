import Context from './context'

import { promises as fs } from 'fs'

import expect from './expect'
import { greenText, redText, generateCachedCollectedPathFromActual } from './utils'

type TestCaseFunction = () => void
type TestCaseGroup = () => void

function describe(label: string, testGroup: TestCaseGroup) {
	if (process.env.COLLECT) {
		testGroup()
		return
	}

	console.group(greenText(label))
	testGroup()
	console.groupEnd()
}

function test(label: string, testCase: TestCaseFunction): void {
	if (process.env.COLLECT) {
		fs.appendFile(`.womm-cache/${generateCachedCollectedPathFromActual(process.argv[1])}`, `${label}\n`)
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
