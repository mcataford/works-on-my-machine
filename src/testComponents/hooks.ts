import { getTestContext } from '../testContext'

export function beforeEach(func: () => void) {
	getTestContext().addBeforeEach(func)
}

export function afterEach(func: () => void) {
	getTestContext().addAfterEach(func)
}
