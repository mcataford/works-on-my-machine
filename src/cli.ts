#!/usr/bin/env node

import helpText from './help'
import parseArgs from './argumentParser'
import { getContext, redText } from './utils'
import { setUpSocket, collectTests, collectCases, assignTestsToWorkers } from './runner'

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
	let server

	try {
		server = setUpSocket(context.runnerSocket)
		const collectedTests = await collectTests(args.targets)
		await collectCases(context, collectedTests)

		await assignTestsToWorkers(context, collectedTests, args.workers)

		if (server.failure) throw new Error()
	} catch (e) {
		console.log(redText('Test run failed'))
	} finally {
		server?.close()
	}
})().catch((e) => {
	throw e
})
