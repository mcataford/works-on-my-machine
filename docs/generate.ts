import * as ts from 'typescript'
import { promises as fs } from 'fs'
import childProcess from 'child_process'
import path from 'path'

interface ExtractedNode {
	name: string
	comment: string
}

interface APIDocumentationNode {
    sourcePath: string
    targetPath: string
    content: string
}

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

    const sourcePaths = output.split('\n').filter(filePath => Boolean(filePath))

    for await (const sourcePath of sourcePaths) {
        const rawContent = await fs.readFile(sourcePath, { encoding: 'utf8' })

        const source = ts.createSourceFile(sourcePath, rawContent, ts.ScriptTarget.ES2015, true)
        const fullText = source.getFullText()
        const extractedNodes: Array<ExtractedNode> = []

        ts.forEachChild(source, (node: ts.Node) => {
            const commentRanges = ts.getLeadingCommentRanges(fullText, node.getFullStart())

            if (commentRanges?.length) {
                const commentStrings: string[] = commentRanges.map((r) => fullText.slice(r.pos, r.end))

                console.log(node.kind)
                extractedNodes.push({
                    name: (node as ts.ClassDeclaration)?.name?.escapedText ?? 'unknown',
                    comment: commentStrings[0],
                })
            }
        })

        const targetPath = `docs/api/${path.basename(sourcePath, '.ts')}.md`
    

        let content = ""

        content += `# ${path.basename(sourcePath, '.ts')}`

        for await (const entry of extractedNodes) {
            const text = `# \`${entry.name}\`\n${entry.comment.replace(/(\/\*)|(\*\/)|(\*)/g, '')}\n`
            content += text
        }


        files.push({
            sourcePath,
            targetPath,
            content 
        })
    }

    for await(const item of files) {
        await fs.writeFile(item.targetPath, item.content)
    }

}

generateDocumentation()
