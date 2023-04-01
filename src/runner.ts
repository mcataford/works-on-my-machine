import { getContext, greenText, redText, exec, generateCachedCollectedPathFromActual } from './utils'
import { type IContext } from './types'

import { promises as fs, type Dirent, type PathLike } from 'fs'
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

async function assignTestsToWorkers(context: IContext, collectedPaths: Array<string>) {
	await exec(`${context.nodeRuntime} ${context.workerRuntime} ${collectedPaths.join(' ')}`, {})
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

function setUpSocket(path: string): net.Server {
	const server = net.createServer()
	server.listen(path, () => {
		console.log('Listening for workers')
	})

	server.on('connection', (s) => {
		console.log('Worker connected')

		s.on('data', (d) => {
			console.log(d.toString('utf8'))
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
