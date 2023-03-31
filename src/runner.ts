import Context from './context'
import { greenText, redText, exec, generateCachedCollectedPathFromActual } from './utils'

import { promises as fs, type Dirent, type PathLike } from 'fs'
import path from 'path'

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

async function runTests(collectedPaths: Array<string>) {
	for await (const collectedPath of collectedPaths) {
		// FIXME: This should just use `node` and transform if TS is present instead.
		const result = await exec(`ts-node ${collectedPath}`, {})
		console.log(result.stdout)
	}
}

async function collectCases(collectedPaths: Array<string>) {
	let collectedCount = 0

	for await (const collectedPath of collectedPaths) {
		// FIXME: This should just use `node` and transform if TS is present instead.
		const result = await exec(`COLLECT=1 ts-node ${collectedPath}`, {})
		const collectedCases = await fs.readFile(
			`.womm-cache/${generateCachedCollectedPathFromActual(path.resolve(collectedPath))}`,
			{ encoding: 'utf8' },
		)
		collectedCount += collectedCases.split('\n').length
	}

	console.log(greenText(`Collected ${collectedCount} cases`))
} /*
 * Logic executed when running the test runner CLI.
 */
;(async () => {
	const [, , collectionRoot, ...omit] = process.argv
	try {
		await fs.mkdir('.womm-cache')

		const collectedTests = await collectTests(collectionRoot)

		await collectCases(collectedTests)
		await runTests(collectedTests)
	} catch (e) {
		console.group(redText('Test run failed'))
		console.log(redText(String(e)))
		console.groupEnd()
	} finally {
		await fs.rm('.womm-cache', { force: true, recursive: true })
	}
})().catch((e) => {
	throw e
})
