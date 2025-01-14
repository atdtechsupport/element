import { ConcreteTestSettings } from './runtime/Settings'

export class Looper {
	public iteration = 0
	private timeout: any
	private cancelled = false
	public loopCount: number
	public isRestart = false

	public done: Promise<void>
	private doneResolve: () => void

	constructor(settings: ConcreteTestSettings, running = true) {
		if (settings.duration > 0) {
			this.timeout = setTimeout(() => {
				this.cancelled = true
			}, Number(settings.duration))
		}

		this.loopCount = settings.loopCount
		this.cancelled = !running
		this.done = new Promise((resolve) => (this.doneResolve = resolve))
	}

	stop() {
		this.cancelled = true
	}

	async kill(): Promise<void> {
		if (this._killer !== undefined) {
			this._killer()
		}
		this.cancelled = true

		await this.done
	}

	_killer: () => void
	set killer(killCb: () => void) {
		this._killer = killCb
	}

	finish() {
		this.isRestart = false
		clearTimeout(this.timeout)
	}

	get continueLoop(): boolean {
		const hasInfiniteLoops = this.loopCount <= 0
		const hasLoopsLeft = this.iteration < this.loopCount

		return !this.cancelled && (hasLoopsLeft || hasInfiniteLoops)
	}

	restartLoop(): void {
		this.isRestart = true
		this.iteration -= 1
	}

	restartLoopDone(): void {
		this.isRestart = false
	}

	async run(iterator: (iteration: number, isRestart: boolean) => Promise<void>): Promise<number> {
		try {
			while (this.continueLoop) {
				await iterator(++this.iteration, this.isRestart)
			}
			this.finish()
		} finally {
			this.doneResolve()
		}

		return this.iteration
	}
}
