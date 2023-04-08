import { greenText, redText, exec, splitIntoBatches } from './utils'
import { type Args, type IContext, type TestServer } from './types'
import { type Buffer } from 'buffer'

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
export async function assignTestsToWorkers(context: IContext, collectedPaths: Array<string>, workerCount: number = 1) {
	const batchedCollectedPaths = splitIntoBatches(collectedPaths, workerCount)

	await Promise.all(
		batchedCollectedPaths.map(async (batch) =>
			exec(`${context.nodeRuntime} ${context.workerRuntime} ${batch.join(' ')}`, {}),
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

export function setUpSocket(socketPath: string): TestServer {
	const server: TestServer = net.createServer()
	server.listen(socketPath, () => {
		console.log('Listening for workers')
		server.workersRegistered = 0
	})

	server.on('connection', (s) => {
		const workerId = server.workersRegistered
		server.workersRegistered = (server.workersRegistered ?? 0) + 1
		console.log(`Worker ${workerId} registered.`)

		s.on('data', (rawMessage: Buffer) => {
			const workerReport: { results: string; failed: boolean } = JSON.parse(rawMessage.toString('utf8'))
			console.log(workerReport.results)

			if (workerReport.failed) server.failure = true
		})
	})

	return server
}
