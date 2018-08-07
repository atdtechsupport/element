import Test from '../Test'
import { Step } from '../Step'
import { NoOpTestObserver, TestObserver } from './Observer'
import { serializeResponseHeaders, serializeRequestHeaders } from '../../utils/headerSerializer'
import { NetworkTraceData } from '../../Reporter'
import { IObjectTrace, NullObjectTrace } from '../../utils/ObjectTrace'
import NetworkRecorder from '../../network/Recorder'
import { Assertion } from '../Assertion'
import { ITestScript } from '../../TestScript'
import { StructuredError } from '../../utils/StructuredError'

import * as debugFactory from 'debug'
const debug = debugFactory('element:test:tracing')

function isAssertionError(error: Error, testScript?: ITestScript): boolean {
	return (
		testScript !== undefined &&
		testScript.isScriptError(error) &&
		error.name.startsWith('AssertionError')
	)
}

export default class TracingObserver extends NoOpTestObserver {
	private trace: IObjectTrace = NullObjectTrace
	private failed: number = 0

	constructor(next: TestObserver) {
		super(next)
	}

	async beforeStep(test: Test, step: Step) {
		this.failed = 0
		this.trace = test.newTrace(step)
		return this.next.beforeStep(test, step)
	}

	async afterStep(test: Test, step: Step) {
		// TODO
		// screenshots.forEach(file => this.trace.addScreenshot(file))

		await this.addNetworkTrace(test, step, test.networkRecorder)

		await this.flushTrace(test, step)

		return this.next.afterStep(test, step)
	}

	async flushTrace(test: Test, step: Step) {
		// console.log('Trace', this.trace.toObject())
		if (this.trace.isEmpty) {
		} else {
			await test.reporter.addTrace(this.trace.toObject(), step.name)
		}

		this.trace = NullObjectTrace
	}

	async onStepError<T>(test: Test, step: Step, err: StructuredError<T>) {
		this.failed++

		if (isAssertionError(err, test.script)) {
			debug('stepFailure - assertion', step.name, err)
			// Handles assertions from assert

			let assertion: Assertion = {
				assertionName: 'AssertionError',
				message: err.message,
				stack: test.script.filterAndUnmapStack(err),
				isFailure: true,
			}

			this.trace.addAssertion(assertion)
			// TODO should return after handling
		} else {
			let errorPayload = {
				message: err.message,
				stack: test.script.filterAndUnmapStack(err).join('\n'),
			}

			this.trace.addError(errorPayload)
		}

		// Take a screenshot on failure
		// TODO add screenshots to step
		if (test.settings.screenshotOnFailure) {
			let screenshots = await test.takeScreenshot()
			screenshots.forEach(file => this.trace.addScreenshot(file))
		}

		return this.next.onStepError(test, step, err)
	}

	private async addNetworkTrace(test: Test, step: Step, networkRecorder: NetworkRecorder) {
		let [document] = networkRecorder.entriesForType('Document')

		// there may be no document if e.g. the step didn't cause any network activity
		if (!document) {
			debug('tracing.addNetworkTrace() - no document')
			return
		}

		let responseHeaders = '',
			requestHeaders = '',
			sourceHost = '',
			startTime = new Date().valueOf(),
			endTime = new Date().valueOf(),
			responseData = ''

		let url = test.currentURL

		responseHeaders = serializeResponseHeaders(document)
		requestHeaders = serializeRequestHeaders(document)
		sourceHost = document.serverIPAddress

		startTime = document.request.timestamp
		endTime = document.response.timestamp
		// url = document.request.url

		if (document.response.content) responseData = document.response.content.text.slice(0, 32 * 1024)

		let traceData: NetworkTraceData = {
			op: 'network',
			label: step.name,
			sampleCount: 1,
			errorCount: this.failed,
			startTime,
			endTime,
			url,
			requestHeaders,
			responseHeaders,
			responseData,
			sourceHost,
		}

		await this.trace.addNetworkTrace(traceData)
	}
}