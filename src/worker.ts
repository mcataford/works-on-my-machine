/*
 * Worker runtime
 *
 * The worker executes the tests by called `node` on them. Since each test
 * is an self-contained executable file, the worker can run each of them,
 * collect output and relay it back to the runner process via IPC.
 *
 * Each worker process is responsible for as many test files as the runner
 * decides to assign it and files assigned to the worker are only
 * touched by the worker assigned to them.
 */

import path from 'path'

import { getContext, spawnProcess } from './utils'

function formatMessage(results: string, failed: boolean): string {
	return JSON.stringify({ results, failed })
}

/*
 * Entrypoint for the worker.
 *
 * Retrieves paths assigned to the worker from the arguments passed when
 * calling the worker runtime and spawns processes to run the test file
 * pointed at by each of the paths.
 *
 * This will spawn one process per file and each process will communicate back
 * to the worker's parent process as it finishes.
 *
 * If the `TS` flag is passed, the worker runs the test file using ts-node
 * for Typescript compatibility.
 */
async function work() {
	if (process?.send === undefined) throw Error('No process global found')
	const tsMode = Boolean(process.env.TS === '1')
	const [, workerRuntime, ...assignedTestFiles] = process.argv
	const context = getContext(workerRuntime, tsMode)

	const extraArgs: Array<string> = []

	if (context.ts) extraArgs.push('--transpile-only')

	const runtime = context.ts ? 'ts-node' : 'node'

	await Promise.all(
		assignedTestFiles.map(
			(testFilePath) =>
				new Promise((resolve, reject) => {
					spawnProcess(runtime, [...extraArgs, path.resolve(testFilePath)], {
						onClose: (code) => {
							resolve(code)
						},
						onStdoutData: (message) => {
							process?.send?.(formatMessage(message.trim(), message.includes('FAILED')))
						},
					})
				}),
		),
	)
}

work().catch((e) => {
	console.log(e)
})
