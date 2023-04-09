import { greenText, redText, exec, fork, splitIntoBatches } from './utils'
import { type Args, type IContext } from './types'

import { promises as fs } from 'fs'
import path from 'path'
import net from 'net'

class UnknownArgumentError extends Error {}

/*
 * Collects test files recursively starting from the provided root
 * path.
 */
export async function collectTests(roots: Array<string>): Promise<Array<string>> {
	const collectedHere = []

	for (const root of roots) {
		const rootStats = await fs.stat(root)

		if (rootStats.isFile() && path.basename(root).endsWith('.test.ts')) {
			collectedHere.push(root)
		} else if (rootStats.isDirectory()) {
			const content = await fs.readdir(root, { encoding: 'utf8' })

			const segmentedCollectedPaths = await Promise.all(
				content.map((item: string) => collectTests([path.join(root, item)])),
			)
			const collectedPaths = segmentedCollectedPaths.reduce((acc: Array<string>, collectedSegment: Array<string>) => {
				acc.push(...collectedSegment)
				return acc
			}, [] as Array<string>)

			collectedHere.push(...collectedPaths)
		}
	}

	return collectedHere
}

/*
 * Splits the list of collected test files into `workerCount` batches and starts
 * worker processes.
 */
export async function assignTestsToWorkers(
	context: IContext,
	collectedPaths: Array<string>,
	workerCount: number = 1,
): Promise<void> {
	const batchedCollectedPaths = splitIntoBatches(collectedPaths, workerCount)

	await Promise.all(
		batchedCollectedPaths.map(
			async (batch) =>
				new Promise((resolve, reject) => {
					const workerProcess = fork(context.workerRuntime, batch, {})

					workerProcess.on('close', (code) => {
						resolve(code)
					})

					workerProcess.on('message', (message: string) => {
						const workerReport: { results: string; failed: boolean } = JSON.parse(message)
						console.log(workerReport.results)
					})
				}),
		),
	)
}

export async function collectCases(context: IContext, collectedPaths: Array<string>, workerCount: number = 1) {
	const batchedCollectedPaths = splitIntoBatches(collectedPaths, workerCount)

	const batchResults = await Promise.all(
		batchedCollectedPaths.map(async (batch) =>
			exec(`${context.nodeRuntime} ${context.collectorRuntime} ${batch.join(' ')}`, {}),
		),
	)

	const collectedCount = batchResults.reduce((total, batchResult) => {
		return total + parseInt(batchResult.stdout)
	}, 0)

	console.log(greenText(`Collected ${collectedCount} cases`))
}
