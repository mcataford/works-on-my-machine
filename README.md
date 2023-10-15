# works-on-my-machine (womm)

## 🗝️ Archival

For the time being, this project is unmaintained and not explicitly looked at. As an experiment, it's not my current
focus. That being said, feel free to fork and or work from it if you please!

---

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

### Hot takes baked in

`womm` is an opinionated implementation of Typescript/Javascript testing libraries we've all come to get used to. You
can peek at the opinions baked into this [here](./DESIGN_DECISIONS.md).

## Documentation

Documentation can be found [here](./docs/INDEX.md) and welcomes contributions!

API documentation can also be found [here](./docs/API.md).

## Development

This uses [Corepack](https://github.com/nodejs/corepack), which comes bundled with `node>=16` to manage which Yarn version to use.

To get started, just `corepack enable` before using `yarn` commands. You can also jump in by running `.
script/bootstrap`, which will select the right version of Node, enable Corepack and install devDependencies.
