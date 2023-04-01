import util from 'util'
import path from 'path'
import childProcess from 'child_process'
import { type IContext } from './types'

export const exec = util.promisify(childProcess.exec)

export function generateCachedCollectedPathFromActual(path: string): string {
	return path.replace(/[\/.]/g, '_')
}

export function greenText(text: string): string {
	return `\x1b[32m${text}\x1b[0m`
}

export function redText(text: string): string {
	return `\x1b[31m${text}\x1b[0m`
}

export function getContext(runnerPath: string): IContext {
	const installDirectory = path.dirname(runnerPath)
	const runnerExtension = path.extname(runnerPath)
	// TODO: We probably don't need this if we transform TS to JS before execution.
	const nodeRuntime = runnerExtension === '.ts' ? 'ts-node' : 'node'

	return {
		workerRuntime: path.join(installDirectory, `worker${runnerExtension}`),
		runnerRuntime: runnerPath,
		collectorRuntime: path.join(installDirectory, `collector${runnerExtension}`),
		nodeRuntime,
		runnerSocket: '/tmp/womm.sock',
	}
}

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
