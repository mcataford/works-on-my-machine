import { performance } from 'perf_hooks'
import { redText, greenText } from './utils'
import { type TestContext, type TestCaseLabel, type TestCaseFunction } from './types'

let _testContext: TestContextExperimental | undefined

export function getTestContext(): TestContextExperimental {
	if (!_testContext) _testContext = new TestContextExperimental()

	return _testContext
}

export function setContext(context: TestContextExperimental) {
	_testContext = context
}

export class TestContextExperimental {
	children: Array<TestContextExperimental>
	tests: Map<TestCaseLabel, TestCaseFunction>
	beforeEach?: () => {}
	afterEach?: () => {}
	parentContext?: TestContextExperimental | null

	constructor(parentContext: TestContextExperimental | null = null) {
		this.tests = new Map()
		this.children = []
		this.parentContext = parentContext
	}

	addTest(testLabel: TestCaseLabel, testFunction: TestCaseFunction) {
		this.tests.set(testLabel, testFunction)
	}

	runTest(label: TestCaseLabel, test: TestCaseFunction) {
		performance.mark(`test-${label}:start`)
		let hasFailed = false
		try {
			test()
		} catch (e) {
			hasFailed = true
			console.log(redText(String(e)))
		}

		performance.mark(`test-${label}:end`)
		const testDuration = performance.measure(`test-${label}`, `test-${label}:start`, `test-${label}:end`).duration

		if (hasFailed) console.log(redText(`❌ [FAILED] ${label} (${(testDuration / 1000).toFixed(3)}s)`))
		else console.log(greenText(`✅ [PASS] ${label} (${(testDuration / 1000).toFixed(3)}s)`))
	}

	runTests() {
		for (const test of this.tests) {
			const [label, testFunction] = test
			this.runTest(label, testFunction)
		}

		for (const child of this.children) {
			child.runTests()
		}
	}
}
