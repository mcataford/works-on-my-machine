#!/usr/bin/env node

import helpText from './help'
import parseArgs from './argumentParser'
import { getContext, redText } from './utils'
import { collectTests, collectCases, assignTestsToWorkers } from './runner'

/*
 * Logic executed when running the test runner CLI.
 */
;(async () => {
	const args = parseArgs(process.argv)

	if (args.help) {
		console.log(helpText)
		return
	}

	const context = getContext(args.runtimePath)

	try {
		const collectedTests = await collectTests(args.targets)
		await collectCases(context, collectedTests)

		await assignTestsToWorkers(context, collectedTests, args.workers)
	} catch (e) {
		console.log(redText('Test run failed'))
	}
})().catch((e) => {
	throw e
})
