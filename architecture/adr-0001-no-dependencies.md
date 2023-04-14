# ADR 1 - No production dependencies
---

# Decision

The project should have no production dependencies that users need to install for core functionality to work.

Some optional peer dependencies are acceptable (i.e. the project installing `womm` might need to install `typescript` to support Typescript tests, etc.). These should not be bundled with `womm`.

Development dependencies should be kept to a minimum and each one present should be thoroughly justified.

# Rationale

The NodeJS ecosystem is too trigger-happy with `npm install` and `yarn add`. Even basic applications quickly end up requiring tens of packages to be shipped to users. A lot of those packages being maintained (or not) by the community, this means that ensuring that the downstream dependency of a project can quickly become a major concern.

The best way to ensure that things are becoming stale is to depend on less, and depending on nothing than the standard library is best.
