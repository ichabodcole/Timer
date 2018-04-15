import {
  Ticker,
  TickerEvent,
  TickerState
} from '@ichabodcole/ticker'

export const TimerEvent = Object.assign({
  COMPLETE: 'COMPLETE',
  RESET: 'RESET'
}, TickerEvent)

export const TimerState = Object.assign({}, TickerState)

export class Timer extends Ticker {
  constructor (duration, interval = 50) {
    super(interval)

    this.duration = duration
    this._startTime = null
    this._stopStartTime = 0
  }

  start () {
    if (this.state !== TimerState.TICKING) {
      if (this.duration > 0 && this.duration != null) {
        const now = Date.now()

        if (this.state === TimerState.STOPPED) {
          this._startTime = this._startTime + (now - this._stopStartTime)
          this._stopStartTime = 0
        }

        this.state = TimerState.TICKING
        this.__createInterval()
        this.emit(TimerEvent.START)

        if (this._startTime === null) {
          this._startTime = now
        }

        this.tick()
      } else {
        throw new Error('Timer:start() ~ Valid duration must be set before calling start. Try a number greater than 0')
      }
    }
  }

  stop () {
    if (this.state === TimerState.TICKING) {
      this.state = TimerState.STOPPED
      this._stopStartTime = Date.now()
      this.__destroyInterval()
      this.emit(TimerEvent.STOP)
    }
  }

  reset () {
    this.state = TimerState.STOPPED
    this.__destroyInterval()
    this.emit(TimerEvent.RESET)
    this._stopStartTime = 0
    this._startTime = null
  }

  tick () {
    const isComplete = this.timeElapsed >= this.duration

    const data = {
      duration: this.duration,
      timeElapsed: this.timeElapsed,
      progress: this.progress
    }

    this.emit(TimerEvent.TICK, data)

    if (isComplete) {
      this.emit(TimerEvent.COMPLETE)
      this.reset()
    }

    return data
  }

  get timeElapsed () {
    return (this._startTime !== null)
      ? Math.min((Date.now() - this._startTime), this.duration)
      : 0
  }

  set timeElapsed (milliseconds) {
    if (milliseconds >= 0) {
      if (milliseconds <= this.duration) {
        this._startTime = Date.now() - milliseconds
      } else {
        throw (new Error(`Timer:timeElapsed ~ Should not be greater than duration (${this.duration}), was (${milliseconds})`))
      }
    } else {
      throw (new Error(`Timer:timeElapsed ~ Should not be less than 0, was (${milliseconds})`))
    }
  }

  get progress () {
    return Math.min((1 / this.duration) * this.timeElapsed, 1)
  }

  set progress (value) {
    if (value < 0 || value > 1) {
      throw new Error(`Timer:progress ~ Should be between 0 and 1, was (${value})`)
    }

    this.timeElapsed = this.duration * value
  }
}

export default Timer
