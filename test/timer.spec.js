
import { Timer, TimerEvent } from '../src/timer';

describe ('Timer', function() {
    var tm, options, model, update;

    beforeEach(function() {
        update = function ( ) {
            return true;
        };

        options = {
            interval: 50,
            model: {}
        };

        tm = new Timer(options);
    });

    describe ('constructor', function() {
        it ('should not throw an error', function() {
            expect(function() {
                new Timer();
            }).not.toThrow();
        });
    });

    describe ('properties', function() {

        describe ('state', function() {
            describe('the default state', function() {
                it('should be STOPPED', function() {
                    expect(tm.state).toBe(Timer.STOPPED);
                });
            });

            describe ('after calling timer.stop', function() {
                it(' should return Timer.STOPPED', function() {
                    expect(tm.state).toBe(Timer.STOPPED);
                });
            });

            describe ('after calling timer.pause', function() {
                it ('should return Timer.PAUSED', function() {
                    tm.duration = 100;
                    tm.start();
                    tm.pause();
                    expect(tm.state).toBe(Timer.PAUSED);
                });
            });

            describe ('after calling timer.start', function() {
                it ('should return Timer.TICKING', function() {
                    tm.duration = 100;
                    tm.start();
                    expect(tm.state).toBe(Timer.TICKING);
                });
            });
        });

        describe ('interval', function() {
            it ('should set the timer models interval value', function() {
                tm.interval = 100;
                expect(tm.model.interval).toBe(100);
            });

            it ('should get the timer modesl interval value', function() {
                tm.model.interval = 100;
                expect(tm.interval).toBe(100);
            });

            it ('should update the setInterval interval period', function() {
                spyOn(tm, 'tick');
                jasmine.clock().install();
                tm.duration = 1000;
                tm.start();
                jasmine.clock().tick(100);
                tm.interval = 100;
                jasmine.clock().tick(100);
                expect(tm.tick.calls.count()).toBe(3);
                jasmine.clock().uninstall();
            });
        });

        describe ('startTime', function() {
            it ('should be null if the Timer has not started', function() {
                expect(tm.startTime).toBe(null);
            });

            it ('should get the Timer models startTime value', function() {

                tm.model.startTime = 100;
                expect(tm.startTime).toBe(100);
            });

            it ('should set the Timer models startTime value minus the current timeAtPause value', function() {
                tm.timeAtPause = 50;
                tm.startTime = 1000;
                expect(tm.startTime).toBe(950);
            });
        });

        describe ('duration', function() {
            it ('should be null if not set', function() {
                expect(tm.duration).toBe(null);
            });

            it ('should set the models duration value', function() {
                tm.duration = 2000;
                expect(tm.model.duration).toEqual(2000);
            });

            it ('should get the Timer models duration value', function() {
                tm.duration = 2500;
                expect(tm.duration).toEqual(2500);
            });

            it ('should only accept positive values', function() {
                expect(function() {
                    tm.duration = -100;
                }).toThrow(new Error('Timer: duration (-100) must be greater than 0'));
            });
        });

        describe ('currentTime', function() {
            it ('should be null before the timer has started', function() {
                expect(tm.currentTime).toBe(null);
            });

            it ('should set the models currentTime value', function() {
                tm.duration = 2000;
                tm.currentTime = 1500;
                expect(tm.model.currentTime).toEqual(1500);
            });

            it ('should get the models currentTime value', function() {
                tm.duration = 2000;
                tm.currentTime = 2000;
                expect(tm.currentTime).toEqual(2000);
            });

            it ('should only allow values less than or equal to the current duration', function() {
                tm.duration = 250;
                expect(function() {
                    tm.currentTime = 300;
                }).toThrow(new Error('Timer: currentTime (300) cannot be greater than duration (250)'));
            });

            it ('should only accept positive numbers', function() {
                tm.duration = 2000;
                expect(function() {
                    tm.currentTime = -150;
                }).toThrow(new Error('Timer: currentTime (-150) cannot be less than 0'));
            });
        });

        describe ('progress', function() {
            it ('should be null before the timer has started', function() {
                expect(tm.progress).toBe(null);
            });

            it ('should set the timer models progress value', function() {
                tm.progress = 0.5;
                expect(tm.model.progress).toEqual(0.5);
            });

            it ('should only accept values between 0 and 1', function() {
                expect(function() {
                    tm.progress = 1.2;
                }).toThrow(new Error('Timer: progress value (1.2) must be between 0 and 1'));

                expect(function() {
                    tm.progress = -0.3;
                }).toThrow(new Error('Timer: progress value (-0.3) must be between 0 and 1'));
            });

            it ('should return a value between 0 and 1 that represents the percent complete', function() {
                tm.progress = 0.5;
                expect(tm.progress).toEqual(0.5);
            });
        });
    });

    describe ('methods', function() {

        beforeEach(function () {
            jasmine.clock().install();
            tm.duration = 100;
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        describe ('start', function() {

            it ('should be defined', function() {
                expect(tm.start).toBeDefined();
            });

            it ('should set the state variable to TICKING', function() {
                tm.start();
                expect(tm.state).toBe(Timer.TICKING);
            });

            it ('should call the tick method every (n)milliseconds based on the interval', function ( ) {
                spyOn(tm, 'tick');
                tm.start();
                jasmine.clock().tick(100);
                expect(tm.tick.calls.count()).toEqual(2);
            });

            it ('should not reset the startTime if the timer is TICKING or PAUSED', function() {
                jasmine.clock().mockDate();
                tm.duration = 1000;
                tm.start();
                jasmine.clock().tick(300);
                var firstStart = tm.currentTime;
                tm.start();
                expect(tm.currentTime).toBe(300);
            });

            it ('should throw and error if duration is not set to a valid value', function() {
                var tm = new Timer(options);
                expect(function() {
                    tm.start();
                }).toThrow(new Error('Timer: valid duration must be set before calling start'));
            });

            it ('should set the models startTime variable to the current dateTime', function() {
                tm.start();
                var now = Date.now();
                expect(tm.model.startTime).toBe(now);
            });
        });

        describe ('stop', function() {
            it ('should be defined', function ( ) {
                expect(tm.stop).toBeDefined();
            });

            it ('should change the state value to STOPPED', function() {
                tm.start();
                tm.stop();
                expect(tm.state).toBe(Timer.STOPPED);
            });

            it ('should stop calling the tick method', function () {
                spyOn(tm, 'tick');
                tm.start();
                tm.stop();
                jasmine.clock().tick(55);
                expect(tm.tick).not.toHaveBeenCalled();
            });

            it ('should emit the STOP event', function () {
                spyOn(tm, 'emit');
                tm.stop();
                expect(tm.emit).toHaveBeenCalledWith(TimerEvent.STOP);
            });
        });

        describe ('pause', function() {
            it ('should be defined', function() {
                expect(tm.pause).toBeDefined();
            });

            it ('should change the state value to PAUSED', function() {
                tm.start();
                tm.pause();
                expect(tm.state).toBe(Timer.PAUSED);
            });

            it ('should not set the timer state to PAUSED if the timer is not TICKING', function() {
                tm.pause();
                expect(tm.state).not.toBe(Timer.PAUSED);
            });

            it ('should toggle the timer state between PAUSED and TICKING', function() {
                tm.start();
                tm.pause();
                tm.pause();
                expect(tm.state).toBe(Timer.TICKING);
            });

            it ('should maintain the currentTime and progress after calling start again', function() {
                jasmine.clock().mockDate();
                tm.duration = 1000;

                tm.start();
                jasmine.clock().tick(100);

                tm.pause();
                jasmine.clock().tick(200);

                tm.start();
                tm.tick();

                expect(tm.currentTime).toBe(100);
            });

            it ('should stop calling the tick method', function () {
                spyOn(tm, 'tick');
                tm.start();
                tm.pause();
                jasmine.clock().tick(55);

                expect(tm.tick).not.toHaveBeenCalled();
            });

            it ('should broadcast the PAUSE event', function () {
                spyOn(tm, 'emit');
                tm.start();
                tm.pause();

                expect(tm.emit).toHaveBeenCalledWith(TimerEvent.PAUSE);
            });
        });

        // the tick event should provide the current duration and progress.
        describe ('tick', function() {
            it ('should broadcast the Timer.TICK event with a data object', function() {
                var tickEventData;
                spyOn(tm, 'emit');

                tm.duration = 100;
                tm.startTime = Date.now();
                tm.tick();

                tickEventData = {
                    duration: tm.duration,
                    currentTime: tm.currentTime,
                    progress: tm.progress
                };

                expect(tm.emit).toHaveBeenCalledWith(TimerEvent.TICK, tickEventData);
            });

            it ('should broadcast the Timer.COMPLETE event when the currentTime is equal or greater than the duration', function() {
                spyOn(tm, 'emit');
                jasmine.clock().mockDate();
                tm.duration = 500;
                tm.start();
                jasmine.clock().tick(510);
                tm.tick();

                expect(tm.emit).toHaveBeenCalledWith(TimerEvent.COMPLETE);
            });

            it ('should call timer.stop when the currentTime is equal or greater than the duration', function() {
                spyOn(tm, 'stop');
                jasmine.clock().mockDate();
                tm.duration = 500;
                tm.start();
                jasmine.clock().tick(500);
                tm.tick();

                expect(tm.stop).toHaveBeenCalled();
            });
        });

        describe ('on', function () {
            it ('should be defined', function ( ) {
                expect(tm.on).toBeDefined();
            });
        });

        describe ('removeListener', function () {
            it ('should be defined', function () {
                expect(tm.removeListener).toBeDefined();
            });
        });
    });
});
