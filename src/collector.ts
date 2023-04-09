#!/usr/bin/env ts-node

import net from 'net'
import { type IContext } from './types'
import { getContext, exec, greenText } from './utils'

// TODO: What should be message protocol / format be?
function formatMessage(results: string, failed: boolean): string {
	return JSON.stringify({ results, failed })
}

async function collectCases(context: IContext, collectedPaths: Array<string>): Promise<number> {
	for await (const collectedPath of collectedPaths) {
		const collectedCount = await new Promise((resolve, reject) => {
			const proc = exec(context.nodeRuntime, [collectedPath], { env: { ...process.env, COLLECT: '1' } })
			let count = 0

			proc.stdout.on('data', (message: string) => {
				count += message
					.toString()
					.split('\n')
					.filter((caseLabel: string) => caseLabel.length > 0).length
			})

			proc.on('close', (code: number) => {
				resolve(count)
			})
		})
		if (process.send) process.send(JSON.stringify({ total: collectedCount }))
	}

	return 0
}

/*
 * Collector worker runtime
 */
async function work() {
	const [, workerRuntime, ...assignedTestFiles] = process.argv
	const context = getContext(workerRuntime)
	const collectedCount = await collectCases(context, assignedTestFiles)
}

work().catch((e) => {
	console.log(e)
})
