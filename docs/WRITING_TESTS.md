# Writing tests with `womm`

## Concepts

WOMM tests use the same high-level concepts present in other test runners like [Jest](https://github.com/facebook/jest) or [Node's built-in test
library](https://nodejs.org/api/test.html).

Test suites are composed of `describe` blocks that allow organizing individual test cases, defined by `it` or `test`
blocks, into meaningful groups. Each test case can have one or more assertion -- you can come up with your own assertion
mechanism, use Node's `assert` library or leverage the `except` built-ins that provide a good range of utilities to
compare and test values.

### Basic example

Here's an example of a basic group of tests you might find in your own application:

```ts
import { describe, test, expect } from 'works-on-my-machine'

describe('Testing some math', () => {
    test('Addition adds', () => {
        expect(1+1).toEqual(2)
    })

    test('Subtraction subtracts', () => {
        expect(2-1).toEqual(1)
    })
})
```

In this example, each of the two test cases is nested under the "Testing some math" group for convenience.

### Parametrization

If you find that your tests present a lot of redundant logic (often accounting for the same test logic being run with
different input), you might want to try parametrizing them using `each`:

```ts
import { describe, test, expect } from 'works-on-my-machine'

test.each([[1,1], [2,2]])(([first, second]) => {
    expect(first).toEqual(second)
})
```

In this case, the test logic is executed with each of the arrays of values provided to `each`.

### Lifecycle hooks

Often, tests have setup and teardown steps. You can enshrine those in your `describe` blocks using `beforeEach` and
`afterEach` blocks:

```ts
import { describe, test, expect, afterEach, beforeEach } from 'works-on-my-machine'

describe('Testing some math', () => {
    beforeEach(() => {
        // Some setup code...
    })

    afterEach(() => {
        // Some teardown code...
    })

    test('Addition adds', () => {
        expect(1+1).toEqual(2)
    })
})
```

When `afterEach` or `beforeEach` are used, the functions passed to them are executed before and after each test case
contains in the `describe` they are in. In the example above, any test within "Testing some math" will have the
`beforeEach` be executed before, and the `afterEach`, after.

:warning: Note that the `beforeEach` and `afterEach` hooks can only be defined once per `describe` block.

If `describe` blocks are nested, the lifecycle hooks defined in each are executed from the outside in:

```ts
import { describe, test, expect, afterEach, beforeEach } from 'works-on-my-machine'

describe('Testing some math', () => {
    beforeEach(() => {
        // Executed first, before each test.
    })

    afterEach(() => {
        // Executed first, after each test.
    })
    
    describe('Testing more precise math', () => {
        beforeEach(() => {
            // Executed second, before each test.
        })

        afterEach(() => {
            // Executed second, after each test.
        })

        test('Addition adds', () => {
            expect(1+1).toEqual(2)
        })

    })
    })
```

