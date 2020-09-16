import { Ticker } from "@ichabodcole/ticker";
import { TimerState, TimerStates } from "./timer-state";
import { TimerEventTypes, TimerEventType } from "./timer-event-type";
import { TimerEvent } from "./timer-event";
import { TimerTickData } from "./timer-tick-data";

export class Timer extends Ticker {
  private _startTime: number | null = null;
  private _stopStartTime = 0;
  private _duration = 0;
  protected _state: TimerState = TimerStates.STOPPED;

  constructor(duration: number, interval = 50) {
    super(interval);

    this.duration = duration;
  }

  start(): void {
    if (this.state !== TimerStates.TICKING) {
      if (this.duration > 0) {
        const now = Date.now();

        if (this.state === TimerStates.STOPPED && this._startTime !== null) {
          this._startTime = this._startTime + (now - this._stopStartTime);
          this._stopStartTime = 0;
        }

        if (this._startTime === null) {
          this._startTime = now;
        }

        super.start();

        this.tick();
      } else {
        console.warn(
          "Timer:start() ~ Valid duration must be set before calling start. Try a number greater than 0",
        );
      }
    }
  }

  stop(): void {
    if (this.state === TimerStates.TICKING) {
      this._stopStartTime = Date.now();
      super.stop();
    }
  }

  reset(): void {
    super.stop();
    this._emit(TimerEventTypes.RESET);
    this._stopStartTime = 0;
    this._startTime = null;
  }

  tick(): void {
    if (this.state !== TimerStates.TICKING) {
      return;
    }

    const isComplete = this.timeElapsed >= this.duration;

    const timerTickData: TimerTickData = {
      duration: this.duration,
      timeElapsed: this.timeElapsed,
      progress: this.progress,
    };

    this._emit(TimerEventTypes.TICK, timerTickData);

    if (isComplete) {
      this._emit(TimerEventTypes.COMPLETE);
      this.reset();
    }
  }

  on(
    timerEvent: TimerEventType,
    func: (timerEvent: TimerEvent) => void,
    ctx?: unknown,
  ): void {
    this._emitter.on(timerEvent, func, ctx);
  }

  off(
    timerEvent: TimerEventType,
    func: (timerEvent: TimerEvent) => void,
    ctx?: unknown,
  ): void {
    this._emitter.off(timerEvent, func, ctx);
  }

  get duration(): number {
    return this._duration;
  }

  set duration(value: number) {
    if (typeof value === "number" && value > 0) {
      this._duration = value;
    } else {
      console.warn(
        `Timer:duration ~ must be greater than 0, was called with ${value}`,
      );
    }
  }

  get timeElapsed(): number {
    return this._startTime !== null
      ? Math.min(Date.now() - this._startTime, this.duration)
      : 0;
  }

  set timeElapsed(milliseconds: number) {
    if (milliseconds >= 0) {
      if (milliseconds <= this.duration) {
        this._startTime = Date.now() - milliseconds;
      } else {
        console.warn(
          `Timer:timeElapsed ~ Should not be greater than duration (${this.duration}), was (${milliseconds})`,
        );
      }
    } else {
      console.warn(
        `Timer:timeElapsed ~ Should not be less than 0, was (${milliseconds})`,
      );
    }
  }

  get progress(): number {
    return Math.min((1 / this.duration) * this.timeElapsed, 1);
  }

  set progress(value: number) {
    if (value < 0 || value > 1) {
      console.warn(
        `Timer:progress ~ Should be between 0 and 1, was (${value})`,
      );
    }

    this.timeElapsed = this.duration * value;
  }

  protected _emit(type: TimerEventType, data?: TimerTickData): boolean {
    const timerEvent: TimerEvent = data ? { type, data } : { type };
    return this._emitter.emit(type, timerEvent);
  }
}
