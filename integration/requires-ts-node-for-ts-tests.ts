import assert from 'assert'
import { promises as fs } from 'fs'
import util from 'util'
import childProcess from 'child_process'

const exec = util.promisify(childProcess.exec)

const TEST_ID = "requires-ts-node-for-ts-tests"
const TEST_DIRECTORY = `integration-test-${TEST_ID}`

const execOptions = { cwd: TEST_DIRECTORY }

async function setUp() {
    await fs.mkdir(TEST_DIRECTORY)
    await fs.writeFile(`${TEST_DIRECTORY}/package.json`, JSON.stringify({}))
    await exec('touch yarn.lock', execOptions)
    await exec('yarn add ../package.tgz', execOptions)
}

async function tearDown() {
    await fs.rm(TEST_DIRECTORY, { recursive: true, force: true })
}

/*
 * The runner skips Typescript files if the --ts flag is not used.
 * A notice is printed about the skipped files.
 */
async function requires_ts_node_for_ts_tests() {
    try {
        await setUp()

        await exec('touch sample.test.ts', execOptions)
        const processOut = await exec('womm .', execOptions)

        const stdout = processOut.stdout

        assert.ok(stdout.includes('sample.test.ts is not supported without --ts and will be ignored'), 'Unsupported test notice not found')
        assert.ok(stdout.includes('Collected 0 test files'), 'Did not find notice of no test collected')
        assert.ok(stdout.includes('Collected 0 test cases'), 'Did not find notice of no cases collected')
    } catch(e) {
        await tearDown()
        console.log(e)
        assert.fail(`[FAILED] ${TEST_ID}`)
    } 
    
    await tearDown()

    console.log(`[PASS] ${TEST_ID}`)
}

requires_ts_node_for_ts_tests().catch((e) => {
    console.error(e)
    process.exit(1)
})
