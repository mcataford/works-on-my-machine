import util from 'util'
import childProcess from 'child_process'

export const exec = util.promisify(childProcess.exec)

export function generateCachedCollectedPathFromActual(path: string): string {
	return path.replace(/[\/.]/g, '_')
}

export function greenText(text: string): string {
	return `\x1b[32m${text}\x1b[0m`
}

export function redText(text: string): string {
	return `\x1b[31m${text}\x1b[0m`
}

export function createMarkIfNotExist(label: string) {
	const existingMarks = performance.getEntriesByName(label)

	if (existingMarks.length !== 0) return

	performance.mark(label)
}
