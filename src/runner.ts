import { getContext, greenText, redText, exec, generateCachedCollectedPathFromActual, splitIntoBatches } from './utils'
import { type IContext, type TestServer } from './types'

import { promises as fs } from 'fs'
import path from 'path'
import net from 'net'

/*
 * Collects test files recursively starting from the provided root
 * path.
 */
async function collectTests(root: string): Promise<Array<string>> {
	const collectedHere = []

	const rootStats = await fs.stat(root)

	if (rootStats.isFile() && path.basename(root).endsWith('.test.ts')) {
		collectedHere.push(root)
	} else if (rootStats.isDirectory()) {
		const content = await fs.readdir(root, { encoding: 'utf8' })

		const segmentedCollectedPaths = await Promise.all(
			content.map((item: string) => collectTests(path.join(root, item))),
		)
		const collectedPaths = segmentedCollectedPaths.reduce((acc: Array<string>, collectedSegment: Array<string>) => {
			acc.push(...collectedSegment)
			return acc
		}, [] as Array<string>)

		collectedHere.push(...collectedPaths)
	}

	return collectedHere
}

/*
 * Splits the list of collected test files into `workerCount` batches and starts
 * worker processes.
 */
async function assignTestsToWorkers(context: IContext, collectedPaths: Array<string>, workerCount: number = 1) {
	const batchedCollectedPaths = splitIntoBatches(collectedPaths, workerCount)

	await Promise.all(
		batchedCollectedPaths.map(async (batch) =>
			exec(`${context.nodeRuntime} ${context.workerRuntime} ${batch.join(' ')}`, {}),
		),
	)
}

async function collectCases(context: IContext, collectedPaths: Array<string>, workerCount: number = 1) {
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

function setUpSocket(socketPath: string): TestServer {
	const server: TestServer = net.createServer()
	server.listen(socketPath, () => {
		console.log('Listening for workers')
		server.workersRegistered = 0
	})

	server.on('connection', (s) => {
		const workerId = server.workersRegistered
		server.workersRegistered = (server.workersRegistered ?? 0) + 1
		console.log(`Worker ${workerId} registered.`)

		s.on('data', (d) => {
			const workerReport: any = JSON.parse(d.toString('utf8'))
			console.log(workerReport.results)

			if (workerReport.failed) server.failure = true
		})
	})

	return server
} /*
 * Logic executed when running the test runner CLI.
 */
;(async () => {
	const [, runnerPath, collectionRoot, ...omit] = process.argv
	const context = getContext(runnerPath)
	let server

	try {
		await fs.mkdir('.womm-cache')
		server = setUpSocket(context.runnerSocket)
		const collectedTests = await collectTests(collectionRoot)
		await collectCases(context, collectedTests)
		await assignTestsToWorkers(context, collectedTests)

		if (server.failure) throw new Error('test')
	} catch (e) {
		console.group(redText('Test run failed'))
		console.log(redText(String(e)))
		console.groupEnd()
	} finally {
		server?.close()
		await fs.rm('.womm-cache', { force: true, recursive: true })
	}
})().catch((e) => {
	throw e
})
