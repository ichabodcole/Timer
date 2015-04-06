var EventEmitter = require('events').EventEmitter;

// Ticker event types
export var TickerEvent = {
    TICK: 'ticker:tick',
    START: 'ticker:start',
    STOP: 'ticker:stop'
};

export class Ticker extends EventEmitter {
    constructor(options={}) {
        // Allow option to override events object if desired.
        this.model = Object.assign({}, options.model || {});
        // Initialize Model
        this.tickInterval = null;
        this.interval = options.interval || 50;
        this.state = Ticker.STOPPED;
    }

    start () {
        this.state = Ticker.TICKING;
        this.createInterval();
        this.emit(TickerEvent.START);
    }

    stop () {
        this.state = Ticker.STOPPED;
        this.destroyInterval();
        this.emit(TickerEvent.STOP);
    }

    tick () {
        this.emit(TickerEvent.TICK);
    }

    createInterval () {
        this.destroyInterval();
        this.tickInterval = setInterval(this.tick.bind(this), this.interval);
    }

    destroyInterval() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
    }

    set interval(milliseconds) {
        this.model.interval = milliseconds;
        if(this.state === Ticker.TICKING) {
            this.createInterval();
        }
    }

    get interval() {
        return this.model.interval;
    }

    set state(state) {
        this.model.state = state;
    }

    get state() {
        return this.model.state;
    }
}
// Ticker states
Ticker.STOPPED = 'stopped';
Ticker.TICKING = 'ticking';

export default Ticker;
