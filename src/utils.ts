import util from 'util'
import childProcess from 'child_process'

export const exec = util.promisify(childProcess.exec)

export function greenText(text: string): string {
	return `\x1b[32m${text}\x1b[0m`
}

export function redText(text: string): string {
	return `\x1b[31m${text}\x1b[0m`
}
