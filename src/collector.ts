#!/usr/bin/env ts-node

import net from 'net'
import { type IContext } from './types'
import { getContext, exec, greenText } from './utils'

async function collectCases(context: IContext, collectedPaths: Array<string>): Promise<number> {
	let totalCases = 0
	for await (const collectedPath of collectedPaths) {
		const collectedCount = await new Promise<number>((resolve, reject) => {
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
