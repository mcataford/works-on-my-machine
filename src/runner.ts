import Context from './context'

import util from 'util'
import childProcess from 'child_process'
import { promises as fs, type Dirent, type PathLike } from 'fs'
import path from 'path'

function greenText(text: string): string {
	return `\x1b[32m${text}\x1b[0m`
}

function redText(text: string): string {
	return `\x1b[31m${text}\x1b[0m`
}

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

		const segmentedCollectedPaths = await Promise.all(content.map((item: string) => collectTests(path.join(root, item))))
		const collectedPaths = segmentedCollectedPaths.reduce((acc: Array<string>, collectedSegment: Array<string>) => {
			acc.push(...collectedSegment)
			return acc
		}, [] as Array<string>)

		collectedHere.push(...collectedPaths)
	}

	return collectedHere
}

/*
 * Collects then executes test cases based on provided test files.
 */
async function runTests(collectedPaths: Array<string>) {
	/*
	 * Test files are imported dynamically so the `test` functions
	 * defined in them are run. Running the functions doesn't actually
	 * run the test, but instead builds the catalog of
	 * known cases, which are executed in the next step.
	 */
	await Promise.all(
		collectedPaths.map(async (collectedPath) => {
			await import(path.resolve(collectedPath))
		}),
	)

	console.log(greenText(`Collected ${Context.collectedTests.size} cases.`))

	/*
	 * Each case collected is executed and can fail independently
	 * of its peers.
	 */
	for (let entry of Context.collectedTests.entries()) {
		const [testLabel, testCase] = entry
		console.group(greenText(`Test: ${testLabel}`))
		try {
			testCase.call()
		} catch (e) {
			console.error(redText(`FAIL ${testLabel}`))
			console.error(e)
		}
		console.groupEnd()
	}
} /*
 * Logic executed when running the test runner CLI.
 */
;(async () => {
	console.group('Test run')
	const collectionRoot = process.argv[2]
	const collectedTests = await collectTests(collectionRoot)

	runTests(collectedTests)
	console.groupEnd()
})().catch((e) => {
	throw e
})
