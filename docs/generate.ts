import * as ts from 'typescript'
import { promises as fs } from 'fs'
import childProcess from 'child_process'
import path from 'path'

interface ExtractedNode {
	name?: string
	comment: string
}

interface APIDocumentationNode {
	sourcePath: string
	targetPath: string
	content: string
}

const API_DOC_PATH = './docs/API.md'

/*
 *  Documentation extraction
 *
 *  This extracts block comments and declared entities from source files
 *  and reformats it so publishable documentation can be generated from it.
 */
async function generateDocumentation() {
	const rootPaths = process.argv.slice(2)
	const output = childProcess.execSync(`find ${rootPaths.join(' ')} -name *.ts`, { encoding: 'utf8' })

	const files: Array<APIDocumentationNode> = []

	const sourcePaths = output.split('\n').filter((filePath) => Boolean(filePath))

	for await (const sourcePath of sourcePaths) {
		const rawContent = await fs.readFile(sourcePath, { encoding: 'utf8' })

		const source = ts.createSourceFile(sourcePath, rawContent, ts.ScriptTarget.ES2015, true)
		const fullText = source.getFullText()
		const extractedNodes: Array<ExtractedNode> = []

		ts.forEachChild(source, (node: ts.Node) => {
			const commentRanges = ts.getLeadingCommentRanges(fullText, node.getFullStart())
			const blockComments = (commentRanges ?? [])
				.filter((comment) => comment.kind === ts.SyntaxKind.MultiLineCommentTrivia)
				.map((r) => {
					return fullText.slice(r.pos, r.end)
				})

			if (blockComments.length === 0) return

			extractedNodes.push({
				name: (node as ts.ClassDeclaration)?.name?.escapedText ?? undefined,
				comment: blockComments[0],
			})
		})

		const targetPath = `docs/api/${path.basename(sourcePath, '.ts')}.md`

		let content = ''

		content += `## ${sourcePath}\n\n`

		for (const entry of extractedNodes) {
            if (entry.name)
			    content += `### \`${entry.name}\`\n\n`

			const entryDescription = entry.comment
				.split('\n')
				.map((line) => line.replace(/(\/\*)|(\*\/)|(\*)/g, '').trim())
				.filter((line) => Boolean(line))
				.join('\n')

			content += `${entryDescription}\n\n`
		}

		files.push({
			sourcePath,
			targetPath,
			content,
		})
	}

	await fs.writeFile(API_DOC_PATH, '# API documentation\n---\n')

	for await (const item of files) {
		await fs.appendFile(API_DOC_PATH, item.content)
	}
}

generateDocumentation()
