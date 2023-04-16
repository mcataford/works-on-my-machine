import { performance } from 'perf_hooks'
import { redText, greenText } from './utils'
import { type TestCaseLabel, type TestCaseFunction } from './types'

import createLogger from './logging'

const logger = createLogger()

let _testContext: TestContext | undefined | null

export function getTestContext(): TestContext {
	if (!_testContext) _testContext = new TestContext()

	return _testContext
}

export function setContext(context: TestContext | null) {
	_testContext = context
}

export class TestContext {
	children: Map<string, TestContext>
	tests: Map<TestCaseLabel, TestCaseFunction>
	parentContext?: TestContext | null

	constructor(parentContext: TestContext | null = null) {
		this.tests = new Map()
		this.children = new Map()
		this.parentContext = parentContext
	}

	addTest(testLabel: TestCaseLabel, testFunction: TestCaseFunction) {
		this.tests.set(testLabel, testFunction)
	}

	addChildContext(label: string): TestContext {
		const childContext = new TestContext(this)
		this.children.set(label, childContext)
		return childContext
	}

	runTest(label: TestCaseLabel, test: TestCaseFunction) {
		performance.mark(`test-${label}:start`)
		let hasFailed = false
		try {
			test()
		} catch (e) {
			hasFailed = true
			logger.logError(String(e))
		}

		performance.mark(`test-${label}:end`)
		const testDuration = performance.measure(`test-${label}`, `test-${label}:start`, `test-${label}:end`).duration

		if (hasFailed) logger.logError(redText(`❌ [FAILED] ${label} (${(testDuration / 1000).toFixed(3)}s)`))
		else logger.log(greenText(`✅ [PASS] ${label} (${(testDuration / 1000).toFixed(3)}s)`))
	}

	runTests() {
		for (const test of this.tests) {
			const [label, testFunction] = test
			this.runTest(label, testFunction)
		}

		for (const child of this.children) {
			const [label, childContext] = child
			logger.group(greenText(label))
			childContext.runTests()
			logger.groupEnd()
		}
	}

	get isRootContext() {
		return this.parentContext === null
	}
}
