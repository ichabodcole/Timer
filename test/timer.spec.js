
import {
  Timer,
  TimerEvent,
  TimerState
} from '../src/Timer'

describe('Timer', () => {
  let tm

  beforeEach(() => {
    tm = new Timer(5000)
  })

  describe('constructor', () => {
    it('should not throw an error', () => {
      expect(() => {
        return new Timer()
      }).not.toThrow()
    })
  })

  describe('properties', () => {
    describe('state', () => {
      describe('the default state', () => {
        it('should be STOPPED', () => {
          expect(tm.state).toBe(TimerState.STOPPED)
        })
      })

      describe('after calling timer.stop', () => {
        it(' should return TimerState.STOPPED', () => {
          tm.start()
          tm.stop()
          expect(tm.state).toBe(TimerState.STOPPED)
        })
      })

      describe('after calling timer.reset', () => {
        it('should return TimerState.STOPPED', () => {
          tm.start()
          tm.reset()
          expect(tm.state).toBe(TimerState.STOPPED)
        })
      })

      describe('after calling timer.start', () => {
        it('should return TimerState.TICKING', () => {
          tm.start()
          expect(tm.state).toBe(TimerState.TICKING)
        })
      })
    })

    describe('interval', () => {
      it('should get the timer interval value', () => {
        tm = new Timer(1000, 100)
        expect(tm.interval).toBe(100)
      })
    })

    describe('duration', () => {
      it('should be null if not set', () => {
        tm = new Timer()
        expect(tm.duration).toBe(undefined)
      })

      it('should set the duration value', () => {
        tm = new Timer(1000)
        tm.duration = 2000
        expect(tm.duration).toEqual(2000)
      })

      it('should get the Timer duration value', () => {
        tm.duration = 2500
        expect(tm.duration).toEqual(2500)
      })

      it('should complete the timer if the duration set to less than the current time elapsed', () => {
        jasmine.clock()
          .install()
          .mockDate()

        tm = new Timer(2000)
        spyOn(tm, 'emit')
        spyOn(tm, 'reset')

        tm.start()
        jasmine.clock().tick(1500)
        tm.duration = 1200
        tm.tick()

        expect(tm.emit).toHaveBeenCalledWith(TimerEvent.COMPLETE)
        expect(tm.reset).toHaveBeenCalled()

        jasmine.clock().uninstall()
      })
    })

    describe('timeElapsed', () => {
      it('should be 0 before the timer has started', () => {
        tm = new Timer()
        expect(tm.timeElapsed).toBe(0)
      })

      it('should return the amount of time elapsed since the timer started', () => {
        jasmine.clock()
          .install()
          .mockDate()

        tm.start()
        jasmine.clock().tick(500)

        expect(tm.timeElapsed).toBe(500)

        jasmine.clock().uninstall()
      })

      it('should set the timeElapsed value', () => {
        jasmine.clock()
          .install()
          .mockDate()

        tm.start()
        tm.timeElapsed = 1000
        tm.tick()
        jasmine.clock().tick(500)

        expect(tm.timeElapsed).toBe(1500)

        jasmine.clock().uninstall()
      })

      it('should only allow values less than or equal to the current duration', () => {
        tm.duration = 250
        expect(() => {
          tm.timeElapsed = 300
        }).toThrow(new Error('Timer:timeElapsed ~ Should not be greater than duration (250), was (300)'))
      })

      it('should only accept positive numbers', () => {
        tm.duration = 2000
        expect(() => {
          tm.timeElapsed = -150
        }).toThrow(new Error('Timer:timeElapsed ~ Should not be less than 0, was (-150)'))
      })
    })

    describe('progress', () => {
      it('should be 0 before the timer has started', () => {
        expect(tm.progress).toBe(0)
      })

      it('should set the timer progress value', () => {
        tm.progress = 0.5
        expect(tm.progress).toEqual(0.5)
      })

      it('should set the timer timeElapsed property to a corresponding value', () => {
        jasmine.clock()
          .install()
          .mockDate()

        tm = new Timer(2000)
        tm.start()
        jasmine.clock().tick(100)

        tm.progress = 0.65
        expect(tm.timeElapsed).toBe(1300)

        jasmine.clock().uninstall()
      })

      it('should not accept values above 1', () => {
        expect(() => {
          tm.progress = 1.2
        }).toThrow(new Error('Timer:progress ~ Should be between 0 and 1, was (1.2)'))
      })

      it('should not accept values below 0', () => {
        expect(() => {
          tm.progress = -0.1
        }).toThrow(new Error('Timer:progress ~ Should be between 0 and 1, was (-0.1)'))
      })
    })
  })

  describe('methods', () => {
    beforeEach(() => {
      jasmine.clock().install().mockDate()
      tm.duration = 5000
    })

    afterEach(() => {
      jasmine.clock().uninstall()
    })

    describe('start', () => {
      it('should be defined', () => {
        expect(tm.start).toBeDefined()
      })

      it('should set the state variable to TICKING', () => {
        tm.start()
        expect(tm.state).toBe(TimerState.TICKING)
      })

      it('should emit the START event', () => {
        spyOn(tm, 'emit')
        tm.start()
        expect(tm.emit).toHaveBeenCalledWith(TimerEvent.START)
      })

      it('should not emit the START event if the timer has already started', () => {
        tm.start()
        spyOn(tm, 'emit')
        tm.start()

        expect(tm.emit).not.toHaveBeenCalledWith(TimerEvent.START)
      })

      it('should fire the first tick immediately', () => {
        spyOn(tm, 'emit')
        tm.start()
        tm.stop()

        const tickEventData = {
          duration: tm.duration,
          timeElapsed: 0,
          progress: 0
        }

        expect(tm.emit).toHaveBeenCalledWith(TimerEvent.TICK, tickEventData)
      })

      it('should call the tick method every (n)milliseconds based on the interval', () => {
        tm = new Timer(5000, 100)
        spyOn(tm, 'tick')
        tm.start()
        jasmine.clock().tick(500)
        expect(tm.tick.calls.count()).toEqual(500 / 100 + 1)
      })

      it('should not reset the startTime if the timer is TICKING', () => {
        tm = new Timer(1000)
        tm.start()
        jasmine.clock().tick(300)
        tm.start()
        expect(tm.timeElapsed).toBe(300)
      })

      it('should throw and error if duration is not set to a valid value', () => {
        var tm = new Timer()
        expect(() => {
          tm.start()
        }).toThrow(new Error('Timer:start() ~ Valid duration must be set before calling start. Try a number greater than 0'))
      })

      it('should set the startTime variable to the current dateTime', () => {
        tm.start()
        expect(tm._startTime).toBe(Date.now())
      })
    })

    describe('stop', () => {
      it('should be defined', () => {
        expect(tm.stop).toBeDefined()
      })

      it('should change the state value to STOPPED', () => {
        tm.start()
        tm.stop()
        expect(tm.state).toBe(TimerState.STOPPED)
      })

      it('should stop calling the tick method', () => {
        tm.start()
        tm.stop()
        spyOn(tm, 'tick')
        jasmine.clock().tick(100)
        expect(tm.tick).not.toHaveBeenCalled()
      })

      it('should emit the STOP event', () => {
        spyOn(tm, 'emit')
        tm.start()
        tm.stop()
        expect(tm.emit).toHaveBeenCalledWith(TimerEvent.STOP)
      })

      it('should not emit the STOP event if the timer has not started', () => {
        spyOn(tm, 'emit')
        tm.stop()
        expect(tm.emit).not.toHaveBeenCalledWith(TimerEvent.STOP)
      })

      it('should maintain the timeElapsed and progress after calling start again', () => {
        jasmine.clock().mockDate()
        tm.duration = 1000

        tm.start()
        jasmine.clock().tick(100)

        tm.stop()
        jasmine.clock().tick(200)

        tm.start()
        tm.tick()

        expect(tm.timeElapsed).toBe(100)
      })
    })

    describe('reset', () => {
      it('should be defined', () => {
        expect(tm.reset).toBeDefined()
      })

      it('should emit the REST event', () => {
        spyOn(tm, 'emit')
        tm.reset()
        expect(tm.emit).toHaveBeenCalledWith(TimerEvent.RESET)
      })

      it('should set the timeElapsed value to 0', () => {
        tm.start()
        jasmine.clock().tick(1000)
        tm.reset()

        expect(tm.timeElapsed).toBe(0)
      })

      it('should set the progress value to 0', () => {
        tm.start()
        jasmine.clock().tick(1000)
        tm.reset()

        expect(tm.progress).toBe(0)
      })
    })

    // the tick event should provide the current duration and progress.
    describe('tick', () => {
      it('should broadcast the TimerState.TICK event with a data object', () => {
        spyOn(tm, 'emit')

        tm.duration = 100
        tm._startTime = Date.now()
        tm.tick()

        const tickEventData = {
          duration: tm.duration,
          timeElapsed: tm.timeElapsed,
          progress: tm.progress
        }

        expect(tm.emit).toHaveBeenCalledWith(TimerEvent.TICK, tickEventData)
      })

      it('should broadcast the TimerState.COMPLETE event when the timeElapsed is equal or greater than the duration', () => {
        spyOn(tm, 'emit')
        tm.duration = 500
        tm.start()
        jasmine.clock().tick(510)

        expect(tm.emit).toHaveBeenCalledWith(TimerEvent.COMPLETE)
      })

      it('should call timer.reset when the timeElapsed is equal or greater than the duration', () => {
        spyOn(tm, 'reset')
        jasmine.clock().mockDate()
        tm.duration = 500
        tm.start()
        jasmine.clock().tick(500)
        tm.tick()

        expect(tm.reset).toHaveBeenCalled()
      })
    })

    describe('on', () => {
      it('should be defined', () => {
        expect(tm.on).toBeDefined()
      })
    })

    describe('removeListener', () => {
      it('should be defined', () => {
        expect(tm.removeListener).toBeDefined()
      })
    })
  })
})
