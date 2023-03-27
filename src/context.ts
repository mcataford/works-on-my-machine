import { type TestCaseLabel, type TestFilePath, type IContext } from './types'

let runnerContext: IContext | null

function getContext(): IContext {
	if (!runnerContext) {
		runnerContext = {
			collectedTests: new Map<TestFilePath, any>(),
			collecting: true,
		}
	}

	return runnerContext
}

export default getContext()
