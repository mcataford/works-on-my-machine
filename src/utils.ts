import util from 'util'
import path from 'path'
import childProcess from 'child_process'
import { type Context } from './types'
import { type Buffer } from 'buffer'

/*
 * Terminal text style
 */
export function boldText(text: string | number): string {
	return `\x1b[1m${text}\x1b[0m`
}

export function yellowText(text: string | number): string {
	return `\x1b[33m${text}\x1b[0m`
}

export function greenText(text: string | number): string {
	return `\x1b[32m${text}\x1b[0m`
}

export function redText(text: string | number): string {
	return `\x1b[31m${text}\x1b[0m`
}

/*
 * To support typescript source directly, womm uses ts-node in
 * workers to execute test files.
 *
 * If ts-node is not installed, this throws.
 */
export function assertTsNodeInstall() {
	try {
		require.resolve('ts-node')
	} catch (e) {
		console.log(redText('Cannot use --ts without also having ts-node installed.'))
		throw e
	}
}

/*
 * Generates a context object that contains general information
 * about the test runner. The parameter here should always be
 * `process.argv[1]`, which will allow all the other paths
 * to be set properly.
 */
export function getContext(runnerPath: string, ts: boolean = false): Context {
	const resolvedRunnerPath = require.resolve(runnerPath)
	const installDirectory = path.dirname(resolvedRunnerPath)
	const runnerExtension = path.extname(resolvedRunnerPath)
	// TODO: We probably don't need this if we transform TS to JS before execution.
	const nodeRuntime = ts ? 'ts-node' : 'node'

	return {
		workerRuntime: path.join(installDirectory, `worker${runnerExtension}`),
		runnerRuntime: runnerPath,
		collectorRuntime: path.join(installDirectory, `collector${runnerExtension}`),
		nodeRuntime,
		ts,
	}
}

/*
 * Divides the given list into `desiredBatchCount` batches, returning
 * an array of arrays which add up to the given list.
 */
export function splitIntoBatches<T>(data: Array<T>, desiredBatchCount: number = 1): Array<Array<T>> {
	const desiredBatchSize = Math.max(data.length / desiredBatchCount, 1)
	return data.reduce((acc, item: T) => {
		if (acc.length === 0) acc.push([])

		const lastBatch = acc[acc.length - 1]

		if (lastBatch.length < desiredBatchSize) {
			lastBatch.push(item)
		} else {
			acc.push([item])
		}

		return acc
	}, [] as Array<Array<T>>)
}

export function forkWorker(
	runtime: string,
	args: Array<string>,
	{
		onClose,
		onMessage,
		extraEnv,
	}: { onClose: (code: number) => void; onMessage: (message: string) => void; extraEnv?: { [key: string]: string } },
): childProcess.ChildProcess {
	const workerProcess = childProcess.fork(runtime, args, { env: { ...process.env, ...(extraEnv ?? {}) } })
	workerProcess.on('message', onMessage)
	workerProcess.on('close', onClose)
	return workerProcess
}

export function spawnProcess(
	command: string,
	args: Array<string>,
	{
		onStdoutData,
		onClose,
		extraEnv,
	}: { onStdoutData: (message: string) => void; onClose: (code: number) => void; extraEnv?: { [key: string]: string } },
): childProcess.ChildProcess {
	const spawnedProcess = childProcess.spawn(command, args, { env: { ...process.env, ...(extraEnv ?? {}) } })

	spawnedProcess.stdout.on('data', (message: Buffer) => onStdoutData(message.toString('utf8')))

	spawnedProcess.on('close', onClose)

	return spawnedProcess
}
