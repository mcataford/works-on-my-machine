import { getContext, greenText, redText, exec, generateCachedCollectedPathFromActual } from './utils'
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
	const desiredBatchSize = Math.max(collectedPaths.length / workerCount, 1)
	const batchedCollectedPaths = collectedPaths.reduce((acc, path: string) => {
		if (acc.length === 0) acc.push([])

		const lastBatch = acc[acc.length - 1]

		if (lastBatch.length < desiredBatchSize) {
			lastBatch.push(path)
		} else {
			acc.push([path])
		}

		return acc
	}, [] as Array<Array<string>>)

	await Promise.all(
		batchedCollectedPaths.map(async (batch) =>
			exec(`${context.nodeRuntime} ${context.workerRuntime} ${batch.join(' ')}`, {}),
		),
	)
}

async function collectCases(context: IContext, collectedPaths: Array<string>) {
	let collectedCount = 0

	for await (const collectedPath of collectedPaths) {
		const result = await exec(`COLLECT=1 ${context.nodeRuntime} ${collectedPath}`, {})
		const collectedCases = await fs.readFile(
			`.womm-cache/${generateCachedCollectedPathFromActual(path.resolve(collectedPath))}`,
			{ encoding: 'utf8' },
		)
		collectedCount += collectedCases.split('\n').length
	}

	console.log(greenText(`Collected ${collectedCount} cases`))
}

function setUpSocket(socketPath: string): TestServer {
	const server: TestServer = net.createServer()
	server.listen(socketPath, () => {
		console.log('Listening for workers')
	})

	server.on('connection', (s) => {
		console.log('Worker connected')

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
