'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Timer = exports.TimerEvent = undefined;

var _ticker = require('@ichabodcole/ticker');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TimerEvent = Object.assign({
    // Timer event types
    PAUSE: 'timer:pause',
    COMPLETE: 'timer:complete'
}, _ticker.TickerEvent);

var Timer = (function (_Ticker) {
    _inherits(Timer, _Ticker);

    function Timer() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Timer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Timer).call(this, options));

        _this.timeAtPause = 0;

        _this.model.state = Timer.STOPPED;
        _this.model.startTime = null;
        _this.model.currentTime = _this.model.currentTime || null;
        _this.model.progress = _this.model.progress || null;
        _this.model.duration = _this.model.duration || null;
        return _this;
    }

    _createClass(Timer, [{
        key: 'start',
        value: function start() {
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
    }, {
        key: 'pause',
        value: function pause() {
            if (this.state === Timer.TICKING) {
                this.state = Timer.PAUSED;
                this.timeAtPause = this.currentTime;
                this.destroyInterval();
                this.emit(TimerEvent.PAUSE);
            } else if (this.state === Timer.PAUSED) {
                this.start();
            }
        }
    }, {
        key: 'stop',
        value: function stop() {
            this.state = Timer.STOPPED;
            this.destroyInterval();
            this.emit(TimerEvent.STOP);
            this.timeAtPause = 0;
        }
    }, {
        key: 'tick',
        value: function tick() {
            var data;
            var now = Date.now();
            var currentTime = now - this.startTime;

            // Stop the Timer and broadcast the COMPLETE event type
            // if currentTime is equal to or greater than duration.
            if (currentTime >= this.duration) {
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
                this.progress = 1 / this.duration * this.currentTime;

                data = {
                    duration: this.duration,
                    currentTime: this.currentTime,
                    progress: this.progress
                };

                this.emit(TimerEvent.TICK, data);
            }
        }
    }, {
        key: 'state',
        set: function set(state) {
            this.model.state = state;
        },
        get: function get() {
            return this.model.state;
        }
    }, {
        key: 'startTime',
        set: function set(milliseconds) {
            this.model.startTime = milliseconds - this.timeAtPause;
        },
        get: function get() {
            return this.model.startTime;
        }
    }, {
        key: 'duration',
        set: function set(milliseconds) {
            if (milliseconds > 0) {
                this.model.duration = milliseconds;
            } else {
                throw new Error('Timer: duration (' + milliseconds + ') must be greater than 0');
            }
        },
        get: function get() {
            return this.model.duration;
        }
    }, {
        key: 'currentTime',
        set: function set(milliseconds) {
            if (milliseconds >= 0) {
                if (milliseconds <= this.duration) {
                    this.model.currentTime = milliseconds;
                } else {
                    throw new Error('Timer: currentTime (' + milliseconds + ') cannot be greater than duration (' + this.duration + ')');
                }
            } else {
                throw new Error('Timer: currentTime (' + milliseconds + ') cannot be less than 0');
            }
        },
        get: function get() {
            return this.model.currentTime;
        }
    }, {
        key: 'progress',
        set: function set(progress) {
            if (progress >= 0 && progress <= 1) {
                this.model.progress = progress;
            } else {
                throw new Error('Timer: progress value (' + progress + ') must be between 0 and 1');
            }
        },
        get: function get() {
            return this.model.progress;
        }
    }]);

    return Timer;
})(_ticker.Ticker);

// Timer states

Timer.PAUSED = 'paused';

exports.default = Timer;
exports.TimerEvent = TimerEvent;
exports.Timer = Timer;
