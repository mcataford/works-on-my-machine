#!/usr/bin/env ts-node

import net from 'net'

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
	for await (const testFilePath of assignedTestFiles) {
		const result = await exec(`${context.nodeRuntime} ${testFilePath}`, {})
		process.send(formatMessage(result.stdout, result.stdout.includes('FAILED')))
	}
}

work().catch((e) => {
	console.log(e)
})
