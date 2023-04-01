import { type Server } from 'net'

export type TestCaseLabel = string
export type TestFilePath = string
export type TestCaseFunction = () => void
export type TestCaseGroup = () => void

export interface TestServer extends Server {
	failure?: boolean
}

export interface IContext {
	workerRuntime: string
	runnerRuntime: string
	nodeRuntime: 'ts-node' | 'node'
	runnerSocket: string
}
