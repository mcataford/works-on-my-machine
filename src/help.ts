import packageJson from '../package.json'

export default `
Works on my machine v${packageJson.version}

${packageJson.description ?? ''}
---
womm [--collectOnly] [-c] ...<test-files-or-directories>

Flags:
--help, -h: Prints this message
`
