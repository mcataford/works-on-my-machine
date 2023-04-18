# Adding custom matchers

You can extend the set of matchers available by implementing your own and extending `womm` with them. This way, you can
extend the library as needed by your use case.

Matchers come in two flavours: comparison matchers and no-args matchers.

## Comparison & No-Arg matchers

A comparison matcher takes two values (and an optional negation marker):

```ts
function myComparisonMatcher(value, other, negated = false) {
    // Validate that value and other are comparable.
}
```

A no-arg matcher asserts the properties of the value passed to `expect`, but does not allow any additional inputs:

```ts
function myNoArgMatcher(value, negated = false) {
    // Validate `value` on its own.
}
```

Either types of matchers are expected to implement their own negation variant, which is triggered with the `negated` argument is truthy. In those cases, the check should be inverted such that `expect(value).not.myMatcher(...)` is the inverse of `expect(value).myMatcher`.

## Return values

Matchers are expected to return a `MatcherReport` object of the form:

```ts
interface MatcherReport {
    // Whether the assertion passed or not.
    pass: boolean

    // Message to attach to failures, blank on a passing test.
    message: string
}
```

## Extending `Expect` with new matchers

Once your custom matcher is defined, you can extend the `Expect` class with it to make it available:

```ts
import { Expect } from 'works-on-my-machine`

function myMatcher(value, other, negated = false) {
    // Validation...
}

Expect.addMatcher(myMatcher)
```

Any uses of `expect` past this point will have access to `myMatcher` as a matcher, as well as the negation variant of it
through chaining with `.not`.
