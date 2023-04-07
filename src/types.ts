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
	message: string
}

export type MatcherName = string

export type ComparisonMatcher = (value: unknown) => void
export type NoArgMatcher = () => void

export type RawComparisonFuncMatcher = (value: () => unknown, other: unknown) => MatcherReport
export type RawComparisonMatcher = (value: unknown, other: unknown, negated?: boolean) => MatcherReport
export type RawNoArgMatcher = (value: unknown | (() => unknown), negated?: boolean) => MatcherReport
export type RawNoArgFuncMatcher = (value: () => unknown, negated?: boolean) => MatcherReport
export type Matcher = (...rest: Array<unknown>) => void
export type RawMatcher = RawComparisonMatcher | RawNoArgMatcher | RawNoArgFuncMatcher

export interface RawMatchersMap {
	comparisonMatchers: Array<RawComparisonMatcher>
	noArgMatchers: Array<RawNoArgMatcher>
}
