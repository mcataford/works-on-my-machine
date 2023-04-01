import net from 'net'

import { exec } from './utils'

async function work() {
	const socketConnection = net.createConnection('/tmp/womm-runner.sock', async () => {
		const assignedPaths = process.argv.slice(2)

        for await (const testFilePath of assignedPaths) {
		    const result = await exec(`ts-node ${testFilePath}`, {})
		    socketConnection.write(result.stdout)
        }
        socketConnection.destroy()
	})
}

work().catch((e) => {
	console.log(e)
})
