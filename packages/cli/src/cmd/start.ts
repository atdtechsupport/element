// import * as ora from "ora";
import { runCommandLine, runUntilExit, ElementOptions } from '@flood/element'
import { WorkRoot } from '@flood/element/RuntimeEnvironmentAPI'
import { FloodProcessEnv } from '@flood/chrome'
import { ConsoleReporter } from '../utils/ConsoleReporter'
import { Argv, Arguments } from 'yargs'
import { existsSync } from 'fs'
import * as path from 'path'
// import { error } from '../utils/out/error'
import createLogger from '../utils/Logger'

export const handler = (args: Arguments) => {
	const { file } = args
	const dir = path.dirname(file)

	const logger = createLogger('debug', true)
	const reporter = new ConsoleReporter(logger)

	const opts: ElementOptions = {
		logger: logger,
		testScript: file,
		reporter: reporter,
		runEnv: initRunEnv(dir),
	}

	runUntilExit(() => runCommandLine(opts))

	// let spinner
	// if (!args.json) spinner = ora(`Launching test '${file}'`).start()

	// console.log("awaited");
	// process.exit(0);
}

function initRunEnv(root: string) {
	const workRoot = new WorkRoot(root, {
		'test-data': root,
	})

	return {
		workRoot,
		stepEnv(): FloodProcessEnv {
			return {
				BROWSER_ID: 1,
				FLOOD_GRID_REGION: 'local',
				FLOOD_GRID_SQEUENCE_ID: 1,
				FLOOD_GRID_SEQUENCE_ID: 1,
				FLOOD_GRID_INDEX: 1,
				FLOOD_GRID_NODE_SEQUENCE_ID: 1,
				FLOOD_NODE_INDEX: 1,
				FLOOD_SEQUENCE_ID: 1,
				FLOOD_PROJECT_ID: 1,
				SEQUENCE: 1,
			}
		},
	}
}

export const command = 'run <file> [options]'
export const describe = 'Run a test script locally'
export const builder = (yargs: Argv) => {
	yargs
		.option('json', {
			describe: 'Return the test output as JSON',
			default: !process.stdout.isTTY,
		})
		.option('chrome', {
			describe: 'Specify a custom Google Chrome executable path',
		})
		.check(({ file, chrome }) => {
			if (!file.length) return new Error('Please provide a test script')
			if (!existsSync(file)) return new Error(`File does not exist '${file}'`)
			if (chrome && !existsSync(chrome))
				return new Error(`Chrome executable path does not exist '${chrome}'`)
			return true
		})
}