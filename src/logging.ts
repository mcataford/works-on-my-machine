import { redText, greenText, yellowText } from './utils'

/*
 * Standard logger for anything that needs to print messages to the user.
 *
 * This supports the same general functionality as the `Console` logger,
 * including `group` and various levels of logging.
 */
class Logger {
	indent: number = 0

	get #indentPrefix(): string {
		return '  '.repeat(this.indent)
	}

	#formatMessage(text: string): string {
		return `[${new Date().toLocaleString()}] ${text}`
	}

	group(label: string) {
		process.stdout.write(this.#formatMessage(`${label}\n`))
		this.indent += 1
	}

	groupEnd() {
		if (this.indent > 0) this.indent -= 1
	}

	logError(text: string) {
		process.stdout.write(this.#formatMessage(`${this.#indentPrefix}${redText(text)}\n`))
	}

	logWarning(text: string) {
		process.stdout.write(`${this.#indentPrefix}${yellowText(text)}\n`)
	}

	log(text: string) {
		process.stdout.write(this.#formatMessage(`${this.#indentPrefix}${text}\n`))
	}

	logRaw(text: string) {
		process.stdout.write(`${text}\n`)
	}
}

export default () => new Logger()
