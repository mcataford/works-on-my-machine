import { forkWorker, greenText, yellowText, redText, boldText, splitIntoBatches } from './utils'
import { type Args, type Context, type WorkerReport, type CollectorReport } from './types'

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

		if (rootStats.isFile() && (path.basename(root).endsWith('.test.ts') || path.basename(root).endsWith('.test.js'))) {
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

async function collectCases(context: Context, collectedPaths: Array<string>, workerCount: number = 1): Promise<number> {
	const batchedCollectedPaths = splitIntoBatches(collectedPaths, workerCount)

	const batchResults = await Promise.all(
		batchedCollectedPaths.map(
			(batch): Promise<CollectorReport> =>
				new Promise((resolve, reject) => {
					const collectorReport: CollectorReport = { totalCases: 0 }
					forkWorker(context.collectorRuntime, batch, {
						onClose: (code) => {
							resolve(collectorReport)
						},
						onMessage: (message: string) => {
							collectorReport.totalCases += JSON.parse(message).total
						},
						extraEnv: { TS: context.nodeRuntime === 'ts-node' ? '1' : '0' },
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
	context: Context,
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
					const workerProcess = forkWorker(context.workerRuntime, batch, {
						onClose: (code) => {
							performance.mark(`worker-${index}:end`)
							const runtimePerf = performance.measure(
								`worker-${index}:runtime`,
								`worker-${index}:start`,
								`worker-${index}:end`,
							)
							workerReport.returnCode = code
							workerReport.runtime = runtimePerf.duration
							resolve(workerReport)
						},
						onMessage: (message: string) => {
							const workerMessage: { results: string; failed: boolean } = JSON.parse(message)
							if (workerMessage.failed) workerReport.pass = false

							console.log(workerMessage.results)
						},
						extraEnv: { TS: context.nodeRuntime === 'ts-node' ? '1' : '0' },
					})
				}),
		),
	)

	return reports.reduce((summary, report) => {
		summary[report.workerId] = report
		return summary
	}, {} as { [key: number]: WorkerReport })
}

async function run(args: Args, context: Context) {
	performance.mark('run:start')
	performance.mark('test-collect:start')
	const collectedTests = await collectTests(args.targets)

	const supportedTests = collectedTests.filter((testPath) => {
		const supported = (testPath.endsWith('.test.ts') && context.ts) || (!context.ts && !testPath.endsWith('.test.ts'))

		if (!supported) console.log(yellowText(`WARN: ${testPath} is not supported without --ts and will be ignored`))

		return supported
	})
	performance.mark('test-collect:end')
	const testCollectTime = performance.measure('test-collect', 'test-collect:start', 'test-collect:end').duration

	console.log(
		`Collected ${boldText(supportedTests.length)} test files in ${boldText((testCollectTime / 1000).toFixed(3))}s`,
	)

	performance.mark('case-collect:start')
	const collectedCaseCount = await collectCases(context, supportedTests)
	performance.mark('case-collect:end')
	const caseCollectTime = performance.measure('case-collect', 'case-collect:start', 'case-collect:end').duration
	console.log(
		`Collected ${boldText(collectedCaseCount)} test cases in ${boldText((caseCollectTime / 1000).toFixed(3))}s`,
	)
	const summary = await assignTestsToWorkers(context, supportedTests, args.workers)

	const hasFailed = Object.values(summary).filter((workerReport) => !workerReport.pass).length > 0
	performance.mark('run:end')
	const overallTime = performance.measure('run', 'run:start', 'run:end').duration
	console.log(`Ran tests in ${boldText(overallTime / 1000)}s`)

	if (hasFailed) throw new Error('Test run failed')
}

export default run
