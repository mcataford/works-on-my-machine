# Design decisions

`womm` mostly shadows the API of other test runners out there with a few quirks. This document records choices made
along the way and the reasoning behind them.

## No production dependencies

I believe that the NodeJS ecosystem is too trigger-happy with `npm install` and `yarn add`. Even basic applications
quickly end up requiring tens of packages to be shipped to users. A lot of those packages being maintained (or not) by
the community, this means that ensuring that the downstream dependency of a project can quickly become a major concern.

The best way to ensure that things are becoming stale is to depend on less, and depending on nothing than the standard
library is best.

_Some exceptions apply here. Development tooling is easier to handle, but should still be heavily vetted. For this
reason, `womm` has a few dev-facing dependencies, but those are carefully-chosen to make sure that the cost of having
them doesn't outweigh what they bring to the table._

## No snapshot matchers

Snapshot testing is rarely used well. In a lot of cases, it's a crutch used to avoid writing more precise assertions
about software behaviour. This is especially true in browser-facing code where component snapshots clutter codebases and
provide very little confidence that code is healthy -- instead, it measures whether it changed or evolved, and expects
whoever _reads_ the test to validate snapshot contents manually.

Snapshot matchers are not included out-of-the-box in `womm` to promote better practices around test quality and to
remove a foot-gun from the tooling.

