#!/usr/bin/env node

import helpText from './help'
import parseArgs from './argumentParser'
import { getContext, redText } from './utils'
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

	const context = getContext(args.runtimePath)

	try {
		run(args, context)
	} catch (e) {
		console.log(redText('Test run failed'))
	}
})().catch((e) => {
	throw e
})
