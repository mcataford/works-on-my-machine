# API documentation
---
## ./src/worker.ts

---

Worker runtime

The worker executes the tests by called `node` on them. Since each test
is an self-contained executable file, the worker can run each of them,
collect output and relay it back to the runner process via IPC.

Each worker process is responsible for as many test files as the runner
decides to assign it and files assigned to the worker are only
touched by the worker assigned to them.


---
### function / work
```ts
async function work()
```


Entrypoint for the worker.

Retrieves paths assigned to the worker from the arguments passed when
calling the worker runtime and spawns processes to run the test file
pointed at by each of the paths.

This will spawn one process per file and each process will communicate back
to the worker's parent process as it finishes.

If the `TS` flag is passed, the worker runs the test file using ts-node
for Typescript compatibility.


## ./src/testComponents/matchers.ts

---

Built-in matchers

All the matchers defined and exported as part of the default export
of this file are available to each `expect` statement made in tests.


---
### function / toEqual
```ts
function toEqual(value: unknown, other: unknown, negated: boolean = false): MatcherReport
```


Asserts whether value and other are strictly equal.


---
### function / toNotEqual
```ts
function toNotEqual(value: unknown, other: unknown, negated: boolean = false): MatcherReport
```


Inverse of toEqual.


---
### function / toBe
```ts
function toBe(value: unknown, other: unknown, negated: boolean = false): MatcherReport
```


Asserts whether value and other are the same entity.


---
### function / toNotBe
```ts
function toNotBe(value: unknown, other: unknown, negated: boolean = false): MatcherReport
```


Inverse ot toBe.


---
### function / toThrow
```ts
function toThrow(func: () => unknown, negated: boolean = false): MatcherReport
```


Asserts whether the provided function throws the provided error.


---
### function / toNotThrow
```ts
function toNotThrow(func: () => unknown, negated: boolean = false): MatcherReport
```


Inverse of toThrow.


---
### function / toHaveLength
```ts
function toHaveLength(value: unknown, length: unknown, negated: boolean = false): MatcherReport
```


Validates that the `value` has a length of `length`. The value provided to `value` should
have a defined length (i.e. it can be a string or some sort of iterable).


## ./src/testComponents/test.ts

---
### function / test
```ts
function test(label: TestCaseLabel, testCase: TestCaseFunction): void
```


`test` defines a single test case.

```
test('My test', () => {
// Assert things.
})
```


---

`it` is an alias of `test`.


## ./src/testComponents/expect.ts

---

The `expect` function returned is the main access point
to create Expect objects. On import, all the built-in matchers
are registered, but more can be registered ad-hoc via `addMatcher`.


## ./src/testComponents/describe.ts

---
### function / describe
```ts
function describe(label: TestCaseLabel, testGroup: TestCaseGroup)
```


`describe` facilitates grouping tests together.

```
describe('My test group', () => {
test('My first test', ...)

test('My second test', ...)
})
```


## ./src/runner.ts

---
### function / collectTests
```ts
async function collectTests(roots: Array<string>): Promise<Array<string>>
```


Collects test files recursively starting from the provided root
path.


---
### function / assignTestsToWorkers
```ts
async function assignTestsToWorkers(
	context: Context,
	collectedPaths: Array<string>,
	workerCount: number = 1,
): Promise<{ [key: number]: WorkerReport }>
```


Splits the list of collected test files into `workerCount` batches and starts
worker processes.


## ./src/logging.ts

---
### class / Logger

Standard logger for anything that needs to print messages to the user.

This supports the same general functionality as the `Console` logger,
including `group` and various levels of logging.


## ./src/utils.ts

---
### function / boldText
```ts
export function boldText(text: string | number): string
```


Terminal text style


---
### function / assertTsNodeInstall
```ts
export function assertTsNodeInstall()
```


To support typescript source directly, womm uses ts-node in
workers to execute test files.

If ts-node is not installed, this throws.


---
### function / getContext
```ts
export function getContext(runnerPath: string, ts: boolean = false): Context
```


Generates a context object that contains general information
about the test runner. The parameter here should always be
`process.argv[1]`, which will allow all the other paths
to be set properly.


---
### function / splitIntoBatches
```ts
export function splitIntoBatches<T>(data: Array<T>, desiredBatchCount: number = 1): Array<Array<T>>
```


Divides the given list into `desiredBatchCount` batches, returning
an array of arrays which add up to the given list.


