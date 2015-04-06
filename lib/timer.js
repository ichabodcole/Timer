import { Ticker, TickerEvent } from 'ticker';

export var TimerEvent = Object.assign({
    // Timer event types
    PAUSE: 'timer:pause',
    COMPLETE: 'timer:complete'
}, TickerEvent);

export class Timer extends Ticker {
    constructor (options={}) {
        super(options);

        this.timeAtPause = 0;

        this.model.state       = Timer.STOPPED;
        this.model.startTime   = null;
        this.model.currentTime = this.model.currentTime || null;
        this.model.progress    = this.model.progress || null;
        this.model.duration    = this.model.duration || null;
    }

    start () {
        if (this.state !== Timer.TICKING) {
            if (this.duration > 0 && this.duration != null) {
                this.state = Timer.TICKING;
                this.createInterval();
                this.emit(TimerEvent.START);
                this.startTime = Date.now();
                // reset the pause time variables
                this.timeAtPause = 0;
            } else {
                throw new Error('Timer: valid duration must be set before calling start');
            }
        }
    }

    pause () {
        if (this.state === Timer.TICKING) {
            this.state = Timer.PAUSED;
            this.timeAtPause = this.currentTime;
            this.destroyInterval();
            this.emit(TimerEvent.PAUSE);
        } else if (this.state === Timer.PAUSED) {
            this.start();
        }
    }

    stop () {
        this.state = Timer.STOPPED;
        this.destroyInterval();
        this.emit(TimerEvent.STOP);
        this.timeAtPause = 0;
    }

    tick () {
        var data;
        var now = Date.now();
        var currentTime = (now - this.startTime);

        // Stop the Timer and broadcast the COMPLETE event type
        // if currentTime is equal to or greater than duration.
        if(currentTime >= this.duration) {
            this.stop();

            data = {
                duration: this.duration,
                currentTime: this.duration,
                progress: 1
            };

            this.emit(TimerEvent.TICK, data);
            this.emit(TimerEvent.COMPLETE);

        } else {
            this.currentTime = currentTime;
            this.progress = (1 / this.duration) * this.currentTime;

            data = {
                duration: this.duration,
                currentTime: this.currentTime,
                progress: this.progress
            };

            this.emit(TimerEvent.TICK, data);
        }
    }

    set state(state) {
        this.model.state = state;
    }

    get state() {
        return this.model.state;
    }

    set startTime (milliseconds) {
        this.model.startTime = milliseconds - this.timeAtPause;
    }

    get startTime () {
        return this.model.startTime;
    }

    set duration (milliseconds) {
        if (milliseconds > 0) {
            this.model.duration = milliseconds;
        } else {
            throw new Error(`Timer: duration (${milliseconds}) must be greater than 0`);
        }
    }

    get duration () {
        return this.model.duration;
    }

    set currentTime (milliseconds) {
        if (milliseconds >= 0) {
            if (milliseconds <= this.duration) {
                this.model.currentTime = milliseconds;
            } else {
                throw(new Error(`Timer: currentTime (${milliseconds}) cannot be greater than duration (${this.duration})`));
            }
        } else {
            throw(new Error(`Timer: currentTime (${milliseconds}) cannot be less than 0`));
        }
    }

    get currentTime () {
        return this.model.currentTime;
    }

    set progress (progress) {
        if (progress >= 0 && progress <= 1) {
            this.model.progress = progress;
        } else {
            throw new Error(`Timer: progress value (${progress}) must be between 0 and 1`);
        }
    }

    get progress () {
        return this.model.progress;
    }
}
// Timer states
Timer.PAUSED   = 'paused';

export default Timer;
