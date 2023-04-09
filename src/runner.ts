import { greenText, redText, boldText, exec, fork, splitIntoBatches } from './utils'
import { type Args, type IContext, type WorkerReport } from './types'

import { promises as fs } from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'

/*
 * Collects test files recursively starting from the provided root
 * path.
 */
async function collectTests(roots: Array<string>): Promise<Array<string>> {
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

interface CollectorReport {
	totalCases: number
}

async function collectCases(
	context: IContext,
	collectedPaths: Array<string>,
	workerCount: number = 1,
): Promise<number> {
	const batchedCollectedPaths = splitIntoBatches(collectedPaths, workerCount)

	const batchResults = await Promise.all(
		batchedCollectedPaths.map(
			(batch): Promise<CollectorReport> =>
				new Promise((resolve, reject) => {
					const childProcess = fork(context.collectorRuntime, batch, {})
					const collectorReport: CollectorReport = { totalCases: 0 }
					childProcess.on('message', (message: string) => {
						collectorReport.totalCases += JSON.parse(message).total
					})

					childProcess.on('close', (code) => {
						resolve(collectorReport)
					})
				}),
		),
	)

	const collectedCount = batchResults.reduce((total, batchResult) => {
		return total + batchResult.totalCases
	}, 0)

	return collectedCount
}

/*
 * Splits the list of collected test files into `workerCount` batches and starts
 * worker processes.
 */
async function assignTestsToWorkers(
	context: IContext,
	collectedPaths: Array<string>,
	workerCount: number = 1,
): Promise<{ [key: number]: WorkerReport }> {
	const batchedCollectedPaths = splitIntoBatches(collectedPaths, workerCount)

	const reports = await Promise.all(
		batchedCollectedPaths.map(
			async (batch, index): Promise<WorkerReport> =>
				new Promise((resolve, reject) => {
					performance.mark(`worker-${index}:start`)
					const workerReport: WorkerReport = {
						workerId: index,
						pass: true,
						returnCode: null,
						runtime: null,
					}
					const workerProcess = fork(context.workerRuntime, batch, {})

					workerProcess.on('close', (code) => {
						performance.mark(`worker-${index}:end`)
						const runtimePerf = performance.measure(
							`worker-${index}:runtime`,
							`worker-${index}:start`,
							`worker-${index}:end`,
						)
						workerReport.returnCode = code
						workerReport.runtime = runtimePerf.duration
						resolve(workerReport)
					})

					workerProcess.on('message', (message: string) => {
						const workerMessage: { results: string; failed: boolean } = JSON.parse(message)
						if (workerMessage.failed) workerReport.pass = false

						console.log(workerMessage.results)
					})
				}),
		),
	)

	return reports.reduce((summary, report) => {
		summary[report.workerId] = report
		return summary
	}, {} as { [key: number]: WorkerReport })
}

async function run(args: Args, context: IContext) {
	performance.mark('run:start')
	performance.mark('test-collect:start')
	const collectedTests = await collectTests(args.targets)
	performance.mark('test-collect:end')
	const testCollectTime = performance.measure('test-collect', 'test-collect:start', 'test-collect:end').duration

	console.log(
		`Collected ${boldText(collectedTests.length)} test files in ${boldText((testCollectTime / 1000).toFixed(3))}s`,
	)

	performance.mark('case-collect:start')
	const collectedCaseCount = await collectCases(context, collectedTests)
	performance.mark('case-collect:end')
	const caseCollectTime = performance.measure('case-collect', 'case-collect:start', 'case-collect:end').duration
	console.log(
		`Collected ${boldText(collectedCaseCount)} test files in ${boldText((caseCollectTime / 1000).toFixed(3))}s`,
	)
	const summary = await assignTestsToWorkers(context, collectedTests, args.workers)

	performance.mark('run:end')
	const t = performance.measure('run', 'run:start', 'run:end').duration
	console.log(`Ran tests in ${boldText(t / 1000)}s`)
}

export default run
