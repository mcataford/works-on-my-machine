import { boldText } from './utils'
import { FLAG_CONFIGURATION } from './argumentParser'

function getFlagHelp(): string {
	const lines: Array<string> = []

	for (const flag of Object.keys(FLAG_CONFIGURATION)) {
		const requiresValue = FLAG_CONFIGURATION[flag].requiresValue
		lines.push(
			[
				`--${flag}${requiresValue ? '=<x>' : ''}`,
				`${FLAG_CONFIGURATION[flag].description} (default=${FLAG_CONFIGURATION[flag].default})`,
			]
				.map((segment) => segment.padEnd(15))
				.join(''),
		)
	}

	return lines.join('\n')
}

export default `
${boldText('Works on my machine v0.0.0')}

A no-dependency test runner
---
womm <flags> ...<test-files-or-directories>

${boldText('Flags:')}
${getFlagHelp()}
`
