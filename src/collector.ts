#!/usr/bin/env ts-node

import { type Context } from './types'
import { getContext, spawnProcess } from './utils'

async function collectCases(context: Context, collectedPaths: Array<string>): Promise<number> {
	let totalCases = 0
	for await (const collectedPath of collectedPaths) {
		const collectedCount = await new Promise<number>((resolve, reject) => {
			let count = 0
			spawnProcess(context.nodeRuntime, [collectedPath], {
				extraEnv: { COLLECT: '1' },

				onClose: (code) => {
					resolve(count)
				},
				onStdoutData: (message) => {
					count += message
						.toString()
						.split('\n')
						.filter((caseLabel: string) => caseLabel.length > 0).length
				},
			})
		})

		totalCases += collectedCount
	}

	return totalCases
}

/*
 * Collector worker runtime
 */
async function work() {
	const [, workerRuntime, ...assignedTestFiles] = process.argv
	const context = getContext(workerRuntime)
	const collectedCount = await collectCases(context, assignedTestFiles)
	if (process.send) process.send(JSON.stringify({ total: collectedCount }))
}

work().catch((e) => {
	console.log(e)
})
