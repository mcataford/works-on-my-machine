#!/usr/bin/env node

import helpText from './help'
import parseArgs from './argumentParser'
import { getContext, redText, assertTsNodeInstall } from './utils'
import run from './runner'

/*
 * Logic executed when running the test runner CLI.
 */
;(async () => {
	const args = parseArgs(process.argv)

	if (args.help) {
		console.log(helpText)
		return
	}

	if (args.ts) assertTsNodeInstall()

	const context = getContext(args.runtimePath, args.ts)

	try {
		run(args, context)
	} catch (e) {
		console.log(redText('Test run failed'))
		throw e
	}
})().catch((e) => {
	process.exit(1)
})
