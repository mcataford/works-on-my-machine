import { test, expect } from '../src/testCaseUtils'

test('Equality (number)', () => {expect(1).toEqual(1) })

test('Equality (string)', () => { expect('expectations').toEqual('expectations') })

test('Equality (boolean)', () => { expect(true).toEqual(true) })

test('Equality (failed - number)', () => {
    try {
        expect(1).toEqual(2)
    } catch(e) {
        expect(1).toEqual(1)
    }
})


test('Equality (failed - string)', () => {
    try {
        expect('expectation').toEqual('something else')
    } catch(e) {
        expect(1).toEqual(1)
    }
})
test('Equality (failed - boolean)', () => {
    try {
        expect(true).toEqual(false)
    } catch(e) {
        expect(1).toEqual(1)
    }
})
