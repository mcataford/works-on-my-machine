export type TestCaseLabel = string
export type TestFilePath = string
export type TestCaseFunction = () => void

export interface IContext {
	collectedTests: Map<TestFilePath, any>
	collecting: boolean
}
