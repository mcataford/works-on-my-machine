# works-on-my-machine (womm)

> ✨ A full-nonsense pet test runner ✨

## So, what is this?

Software in the NodeJS ecosystem tends to depend  _a lot_ on external dependencies. What would a test runner without any
look like? This is the question that started all of this.

`womm` is a pet test runner that follows the general direction of `jest` and `playwright` with a few additional
constraints:

- It must not have any production dependencies (some development dependencies are permissible, like `typescript` and
  `rome`, but keeping it to a minimum);
- It must be compatible with the general API exposed by Jest and the like, for familiarity;
- It must use itself for testing.
