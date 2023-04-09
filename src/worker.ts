#!/usr/bin/env ts-node

import path from 'path'

import { getContext, exec } from './utils'

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

	const [, workerRuntime, ...assignedTestFiles] = process.argv
	const context = getContext(workerRuntime)

	await Promise.all(
		assignedTestFiles.map(
			(testFilePath) =>
				new Promise((resolve, reject) => {
					const testRunProcess = exec(context.nodeRuntime, [path.resolve(testFilePath)], { env: { ...process.env } })

					testRunProcess.stdout.on('data', (message) => {
						process?.send?.(formatMessage(message.toString('utf8').trim(), message.includes('FAILED')))
					})

					testRunProcess.on('close', (code) => {
						resolve(code)
					})
				}),
		),
	)
}

work().catch((e) => {
	console.log(e)
})
