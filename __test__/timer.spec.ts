import { Timer } from "../src/timer";
import { TimerStates } from "../src/timer-state";
import { TimerEventTypes } from "../src/timer-event-type";
import { TimerTickData } from "../src/timer-tick-data";
import { TimerEvent } from "../src/timer-event";

describe("Timer", () => {
  let tm: Timer;
  let mockFn: jest.Mock;

  beforeEach(() => {
    tm = new Timer(5000);
    jest.useFakeTimers();
    mockFn = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("constructor", () => {
    it("should not throw an error", () => {
      expect(() => {
        return new Timer(3600);
      }).not.toThrow();
    });

    it("should throw an error if duration is not set to a valid number", () => {
      new Timer(-1);

      expect(console.warn).toHaveBeenCalledWith(
        "Timer:duration ~ must be greater than 0, was called with -1",
      );
    });
  });

  describe("properties", () => {
    describe("state", () => {
      describe("the default state", () => {
        it("should be STOPPED", () => {
          expect(tm.state).toBe(TimerStates.STOPPED);
        });
      });

      describe("after calling timer.stop", () => {
        it(" should return TimerStates.STOPPED", () => {
          tm.start();
          tm.stop();
          expect(tm.state).toBe(TimerStates.STOPPED);
        });
      });

      describe("after calling timer.reset", () => {
        it("should return TimerStates.STOPPED", () => {
          tm.start();
          tm.reset();
          expect(tm.state).toBe(TimerStates.STOPPED);
        });
      });

      describe("after calling timer.start", () => {
        it("should return TimerStates.TICKING", () => {
          tm.start();
          expect(tm.state).toBe(TimerStates.TICKING);
        });
      });
    });

    describe("interval", () => {
      it("should get the timer interval value", () => {
        tm = new Timer(1000, 100);
        expect(tm.interval).toBe(100);
      });
    });

    describe("duration", () => {
      it("should throw an error if duration is not set to a valid number", () => {
        tm.duration = 0;

        expect(console.warn).toHaveBeenCalledWith(
          "Timer:duration ~ must be greater than 0, was called with 0",
        );
      });

      it("should set the duration value", () => {
        tm = new Timer(1000);
        tm.duration = 2000;
        expect(tm.duration).toEqual(2000);
      });

      it("should get the Timer duration value", () => {
        tm.duration = 2500;
        expect(tm.duration).toEqual(2500);
      });

      it("should complete and reset the timer if the duration set to less than the current time elapsed", () => {
        tm = new Timer(2000);
        jest.spyOn(tm, "reset");

        tm.on(TimerEventTypes.COMPLETE, mockFn);
        tm.start();

        jest.advanceTimersByTime(1201);

        tm.duration = 1200;
        tm.tick();

        expect(tm.reset).toHaveBeenCalled();
      });
    });

    describe("timeElapsed", () => {
      it("should be 0 before the timer has started", () => {
        tm = new Timer(1000);
        expect(tm.timeElapsed).toBe(0);
      });

      it("should return the amount of time elapsed since the timer started", () => {
        tm.start();

        jest.advanceTimersByTime(500);

        expect(tm.timeElapsed).toBe(500);
      });

      it("should set the timeElapsed value", () => {
        tm.start();
        tm.timeElapsed = 1000;
        tm.tick();

        jest.advanceTimersByTime(500);

        expect(tm.timeElapsed).toBe(1500);
      });

      it("should only allow values less than or equal to the current duration", () => {
        tm.duration = 250;
        tm.timeElapsed = 300;

        expect(console.warn).toHaveBeenCalledWith(
          "Timer:timeElapsed ~ Should not be greater than duration (250), was (300)",
        );
      });

      it("should only accept positive numbers", () => {
        tm.timeElapsed = -150;
        tm.duration = 2000;

        expect(console.warn).toHaveBeenCalledWith(
          "Timer:timeElapsed ~ Should not be less than 0, was (-150)",
        );
      });
    });

    describe("progress", () => {
      it("should be 0 before the timer has started", () => {
        expect(tm.progress).toBe(0);
      });

      it("should set the timer progress value", () => {
        tm.progress = 0.5;
        expect(tm.progress).toEqual(0.5);
      });

      it("should set the timer timeElapsed property to a corresponding value", () => {
        tm.start();

        tm.progress = 0.5;
        expect(tm.timeElapsed).toBe(2500);
      });

      it("should not accept values above 1", () => {
        tm.progress = 1.2;
        expect(console.warn).toHaveBeenCalledWith(
          "Timer:progress ~ Should be between 0 and 1, was (1.2)",
        );
      });

      it("should not accept values below 0", () => {
        tm.progress = -0.1;
        expect(console.warn).toHaveBeenCalledWith(
          "Timer:progress ~ Should be between 0 and 1, was (-0.1)",
        );
      });
    });
  });

  describe("methods", () => {
    describe("start", () => {
      it("should be defined", () => {
        expect(tm.start).toBeDefined();
      });

      it("should set the state variable to TICKING", () => {
        tm.start();
        expect(tm.state).toBe(TimerStates.TICKING);
      });

      it("should emit the START event", () => {
        const timerEvent: TimerEvent = { type: TimerEventTypes.START };
        tm.on(TimerEventTypes.START, mockFn);
        tm.start();
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(timerEvent);
      });

      it("should not emit the START event if the timer has already started", () => {
        tm.on(TimerEventTypes.START, mockFn);
        tm.start();
        tm.start();

        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it("should fire the first tick immediately", () => {
        tm.on(TimerEventTypes.TICK, mockFn);
        tm.start();
        tm.stop();

        const tickEventData: TimerTickData = {
          duration: tm.duration,
          timeElapsed: 0,
          progress: 0,
        };

        const timerEvent: TimerEvent = {
          type: TimerEventTypes.TICK,
          data: tickEventData,
        };

        expect(mockFn).toHaveBeenCalledWith(timerEvent);
      });

      it("should call the tick method every (n)milliseconds based on the interval", () => {
        tm = new Timer(5000, 100);
        jest.spyOn(tm, "tick");
        tm.start();
        jest.advanceTimersByTime(500);
        expect(tm.tick).toBeCalledTimes(500 / 100 + 1);
      });

      it("should not reset the startTime if the timer is TICKING", () => {
        tm = new Timer(1000);
        tm.start();

        jest.advanceTimersByTime(300);

        expect(tm.timeElapsed).toEqual(300);
      });
    });

    describe("stop", () => {
      it("should be defined", () => {
        expect(tm.stop).toBeDefined();
      });

      it("should change the state value to STOPPED", () => {
        tm.start();
        tm.stop();
        expect(tm.state).toBe(TimerStates.STOPPED);
      });

      it("should stop calling the tick method", () => {
        tm.start();
        tm.stop();
        jest.spyOn(tm, "tick");
        jest.advanceTimersByTime(100);
        expect(tm.tick).not.toHaveBeenCalled();
      });

      it("should emit the STOP event", () => {
        const timerEvent: TimerEvent = { type: TimerEventTypes.STOP };
        tm.on(TimerEventTypes.STOP, mockFn);
        tm.start();
        tm.stop();
        expect(mockFn).toHaveBeenCalledWith(timerEvent);
      });

      it("should not emit the STOP event if the timer has not started", () => {
        const timerEvent: TimerEvent = { type: TimerEventTypes.STOP };
        tm.on(TimerEventTypes.STOP, mockFn);
        tm.stop();
        expect(mockFn).not.toHaveBeenCalledWith(timerEvent);
      });

      it("should maintain the timeElapsed and progress after calling start again", () => {
        tm.duration = 1000;

        tm.start();

        jest.advanceTimersByTime(100);

        expect(tm.timeElapsed).toBe(100);

        tm.stop();

        jest.advanceTimersByTime(200);

        tm.start();
        tm.tick();

        expect(tm.timeElapsed).toBe(100);
      });
    });

    describe("reset", () => {
      it("should be defined", () => {
        expect(tm.reset).toBeDefined();
      });

      it("should emit the REST event", () => {
        const timerEvent: TimerEvent = { type: TimerEventTypes.RESET };
        tm.on(TimerEventTypes.RESET, mockFn);
        tm.reset();
        expect(mockFn).toHaveBeenCalledWith(timerEvent);
      });

      it("should set the timeElapsed value to 0", () => {
        tm.start();
        jest.advanceTimersByTime(1000);
        tm.reset();

        expect(tm.timeElapsed).toBe(0);
      });

      it("should set the progress value to 0", () => {
        tm.start();
        jest.advanceTimersByTime(1000);
        tm.reset();

        expect(tm.progress).toBe(0);
      });
    });

    // the tick event should provide the current duration and progress.
    describe("tick", () => {
      it("should not emit a TICK event if start not been called", () => {
        tm.on(TimerEventTypes.TICK, mockFn);

        jest.advanceTimersByTime(2500);

        tm.tick();

        expect(mockFn).not.toHaveBeenCalled();
      });

      it("should emit the TICK event with a data object", () => {
        tm.on(TimerEventTypes.TICK, mockFn);
        tm.start();

        jest.advanceTimersByTime(2500);

        tm.tick();

        const tickEventData = {
          duration: tm.duration,
          timeElapsed: 2500,
          progress: 0.5,
        };
        const timerEvent: TimerEvent = {
          type: TimerEventTypes.TICK,
          data: tickEventData,
        };

        expect(mockFn).toHaveBeenCalledWith(timerEvent);
      });

      it("should emit the COMPLETE event when the timeElapsed is equal or greater than the duration", () => {
        const timerEvent: TimerEvent = { type: TimerEventTypes.COMPLETE };
        tm.on(TimerEventTypes.COMPLETE, mockFn);
        tm.duration = 500;
        tm.start();

        jest.advanceTimersByTime(510);

        tm.tick();

        expect(mockFn).toHaveBeenCalledWith(timerEvent);
      });

      it("should emit the RESET event when the timeElapsed is equal or greater than the duration", () => {
        const timerEvent: TimerEvent = { type: TimerEventTypes.RESET };
        tm.on(TimerEventTypes.RESET, mockFn);
        tm.duration = 500;
        tm.start();

        jest.advanceTimersByTime(510);

        tm.tick();

        expect(mockFn).toHaveBeenCalledWith(timerEvent);
      });

      it("should emit the STOP event when the timeElapsed is equal or greater than the duration", () => {
        const timerEvent: TimerEvent = { type: TimerEventTypes.STOP };
        tm.on(TimerEventTypes.STOP, mockFn);
        tm.duration = 500;
        tm.start();

        jest.advanceTimersByTime(510);

        tm.tick();

        expect(mockFn).toHaveBeenCalledWith(timerEvent);
      });
    });

    describe("on", () => {
      it("should be defined", () => {
        expect(tm.on).toBeDefined();
      });
    });

    describe("off", () => {
      it("should be defined", () => {
        expect(tm.off).toBeDefined();
      });

      it("should stop events for the listener", () => {
        tm.on(TimerEventTypes.TICK, mockFn);
        tm.start();
        expect(mockFn).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(50);
        expect(mockFn).toHaveBeenCalledTimes(2);

        tm.off(TimerEventTypes.TICK, mockFn);
        jest.advanceTimersByTime(500);
        expect(mockFn).toHaveBeenCalledTimes(2);
      });
    });
  });
});
