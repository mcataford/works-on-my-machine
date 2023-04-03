import { type Server } from 'net'

export type TestCaseLabel = string
export type TestFilePath = string
export type TestCaseFunction = () => void
export type TestCaseGroup = () => void

export interface TestServer extends Server {
	failure?: boolean
	workersRegistered?: number
}

export interface IContext {
	workerRuntime: string
	runnerRuntime: string
	collectorRuntime: string
	nodeRuntime: 'ts-node' | 'node'
	runnerSocket: string
}

export interface Args {
	targets: Array<string>
	runtimePath: string
	help: boolean
}

export interface MatcherReport {
	pass: boolean
	stdout: string
}

export interface ExpectBase<ValueType> {
	value?: ValueType
	negated?: boolean
	not: ExpectBase<ValueType> & any
	addMatcher: (this: ExpectBase<ValueType> & any, matcher: any) => void
}

export type ComparisonMatcher = (value: unknown) => boolean

export type Expect<ValueType> = ExpectBase<ValueType> & { [key: string]: ComparisonMatcher }
