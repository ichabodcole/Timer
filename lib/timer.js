'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Timer = exports.TimerState = exports.TimerEvent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ticker = require('@ichabodcole/ticker');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TimerEvent = exports.TimerEvent = Object.assign({
  COMPLETE: 'COMPLETE',
  RESET: 'RESET'
}, _ticker.TickerEvent);

var TimerState = exports.TimerState = Object.assign({}, _ticker.TickerState);

var Timer = exports.Timer = function (_Ticker) {
  _inherits(Timer, _Ticker);

  function Timer(duration) {
    var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;

    _classCallCheck(this, Timer);

    var _this = _possibleConstructorReturn(this, (Timer.__proto__ || Object.getPrototypeOf(Timer)).call(this, interval));

    _this.duration = duration;
    _this._startTime = null;
    _this._stopStartTime = 0;
    return _this;
  }

  _createClass(Timer, [{
    key: 'start',
    value: function start() {
      if (this.state !== TimerState.TICKING) {
        if (this.duration > 0 && this.duration != null) {
          var now = Date.now();

          if (this.state === TimerState.STOPPED) {
            this._startTime = this._startTime + (now - this._stopStartTime);
            this._stopStartTime = 0;
          }

          this.state = TimerState.TICKING;
          this.__createInterval();
          this.emit(TimerEvent.START);

          if (this._startTime === null) {
            this._startTime = now;
          }
        } else {
          throw new Error('Timer:start() ~ Valid duration must be set before calling start. Try a number greater than 0');
        }
      }
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (this.state === TimerState.TICKING) {
        this.state = TimerState.STOPPED;
        this._stopStartTime = Date.now();
        this.__destroyInterval();
        this.emit(TimerEvent.STOP);
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.state = TimerState.STOPPED;
      this.__destroyInterval();
      this.emit(TimerEvent.RESET);
      this._stopStartTime = 0;
      this._startTime = null;
    }
  }, {
    key: 'tick',
    value: function tick() {
      var isComplete = this.timeElapsed >= this.duration;

      var data = {
        duration: this.duration,
        timeElapsed: this.timeElapsed,
        progress: this.progress
      };

      this.emit(TimerEvent.TICK, data);

      if (isComplete) {
        this.emit(TimerEvent.COMPLETE);
        this.reset();
      }

      return data;
    }
  }, {
    key: 'timeElapsed',
    get: function get() {
      return this._startTime !== null ? Math.min(Date.now() - this._startTime, this.duration) : 0;
    },
    set: function set(milliseconds) {
      if (milliseconds >= 0) {
        if (milliseconds <= this.duration) {
          this._startTime = Date.now() - milliseconds;
        } else {
          throw new Error('Timer:timeElapsed ~ Should not be greater than duration (' + this.duration + '), was (' + milliseconds + ')');
        }
      } else {
        throw new Error('Timer:timeElapsed ~ Should not be less than 0, was (' + milliseconds + ')');
      }
    }
  }, {
    key: 'progress',
    get: function get() {
      return Math.min(1 / this.duration * this.timeElapsed, 1);
    },
    set: function set(value) {
      if (value < 0 || value > 1) {
        throw new Error('Timer:progress ~ Should be between 0 and 1, was (' + value + ')');
      }

      this.timeElapsed = this.duration * value;
    }
  }]);

  return Timer;
}(_ticker.Ticker);

exports.default = Timer;
