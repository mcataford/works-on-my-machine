import { type Args, type FlagConfigurationMap } from './types'

export const FLAG_CONFIGURATION: Readonly<FlagConfigurationMap> = {
	workers: {
		requiresValue: true,
		default: 1,
		description: 'Defines up to how many parallel processes should consume tests.',
	},
	help: {
		requiresValue: false,
		default: false,
		description: 'Displays the help text.',
	},
	ts: {
		requiresValue: false,
		default: false,
		description: 'Use ts-node to run tests (enables typescript support)',
	},
}

class MalformedArgumentError extends Error {}

function parseFlags(flags: Array<string>): Map<string, string | number | boolean> {
	const flagMap = new Map<string, string | number | boolean>()

	for (const flag of flags) {
		const [flagName, flagValue] = flag.split('=') as Array<string>
		const flagNameWithoutPrefix = flagName.replace(/^--/, '')
		const flagConfiguration = FLAG_CONFIGURATION[flagNameWithoutPrefix]

		if (!flagConfiguration) throw new MalformedArgumentError(`"${flagName}" is not a valid flag.`)

		if (flagConfiguration.requiresValue && !flagValue)
			throw new MalformedArgumentError(`"${flagName}" requires a value.`)

		flagMap.set(flagNameWithoutPrefix, flagValue ?? true)
	}

	return flagMap
}

function parseArgs(args: Array<string>): Args {
	const [, runtimePath, ...userArgs] = args

	const {
		argsWithoutFlags,
		flags,
	}: {
		argsWithoutFlags: Array<string>
		flags: Array<string>
	} = (userArgs as Array<string>).reduce(
		(acc, arg: string) => {
			if (arg.startsWith('--')) acc.flags.push(arg)
			else acc.argsWithoutFlags.push(arg)

			return acc
		},
		{ argsWithoutFlags: [], flags: [] } as {
			argsWithoutFlags: Array<string>
			flags: Array<string>
		},
	)

	const parsedFlags = parseFlags(flags)

	return {
		runtimePath,
		targets: argsWithoutFlags ?? [],
		help: Boolean(parsedFlags.get('help') ?? FLAG_CONFIGURATION['help'].default),
		workers: Number(parsedFlags.get('workers') ?? FLAG_CONFIGURATION['workers'].default),
		ts: Boolean(parsedFlags.get('ts') ?? FLAG_CONFIGURATION['ts'].default),
	}
}

export default parseArgs
