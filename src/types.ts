export type TestCaseLabel = string
export type TestFilePath = string
export type TestCaseFunction = () => void
export type TestCaseGroup = () => void

export interface IContext {
	collectedTests: Map<TestFilePath, any>
}
