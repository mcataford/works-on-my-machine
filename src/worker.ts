import net from 'net'

import { getContext, exec } from './utils'

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
	const [, workerRuntime, ...assignedTestFiles] = process.argv
	const context = getContext(workerRuntime)
	const socketConnection = net.createConnection(context.runnerSocket, async () => {
		for await (const testFilePath of assignedTestFiles) {
			const result = await exec(`${context.nodeRuntime} ${testFilePath}`, {})
			// TODO: Define IPC protocol
			socketConnection.write(result.stdout)
		}
		socketConnection.destroy()
	})
}

work().catch((e) => {
	console.log(e)
})
