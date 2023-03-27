import Context from './context'

import expect from './expect'

function test(label: string, testCase: any) {
	// Hack to get the file that contains the test definition.
	const _prepareStackTrace = Error.prepareStackTrace
	Error.prepareStackTrace = (_, stack) => stack
	const stack = new Error().stack?.slice(1)
	Error.prepareStackTrace = _prepareStackTrace

	const testCaseLocation = stack?.[0] ?? 'unknown'
	Context.collectedTests.set(`${testCaseLocation}:${label}`, testCase)
}

const it = test

export { it, test, expect }
