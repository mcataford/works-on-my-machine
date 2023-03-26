import { test, expect } from '../src/testCaseUtils'

test('test', () => {
	console.log('here')
	throw Error('test')
})
test('test 2', () => {
	expect('yolo').toEqual('bolo')
})
