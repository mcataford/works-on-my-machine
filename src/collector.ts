import net from 'net'
import { type IContext } from './types'
import { getContext, exec, greenText } from './utils'

// TODO: What should be message protocol / format be?
function formatMessage(results: string, failed: boolean): string {
	return JSON.stringify({ results, failed })
}

async function collectCases(context: IContext, collectedPaths: Array<string>): Promise<number> {
	let collectedCount = 0

	for await (const collectedPath of collectedPaths) {
		const result = await exec(`COLLECT=1 ${context.nodeRuntime} ${collectedPath}`, {})
		collectedCount += result.stdout.split('\n').filter((caseLabel) => caseLabel.length > 0).length
	}

	return collectedCount
}

/*
 * Collector worker runtime
 */
async function work() {
	const [, workerRuntime, ...assignedTestFiles] = process.argv
	const context = getContext(workerRuntime)
	const collectedCount = await collectCases(context, assignedTestFiles)

	console.log(collectedCount)
}

work().catch((e) => {
	console.log(e)
})
