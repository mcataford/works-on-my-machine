#!/usr/bin/env ts-node

import path from 'path'

import { getContext, spawnProcess } from './utils'

// TODO: What should be message protocol / format be?
function formatMessage(results: string, failed: boolean): string {
	return JSON.stringify({ results, failed })
}

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
