import { Ticker, TickerEvent } from '../lib/ticker';


describe ('Ticker', function () {
    var tk, options, update;

    beforeEach(function () {
        update = function ( ) {
            return true;
        };
        options = {
            interval: 50
        }
        tk = new Ticker(options);
    });

    describe ('constructor', function () {
        it ('should not throw', function () {
            expect(function ( ) {
                new Ticker();
            }).not.toThrow();
        });
    });

    describe ('properties', function() {

        describe ('state', function() {
            describe('the default state', function() {
                it('should be STOPPED', function() {
                    expect(tk.state).toBe(Ticker.STOPPED);
                })
            })

            describe ('after calling ticker.stop', function() {
                it ('should return Ticker.STOPPED', function() {
                    tk.start();
                    tk.stop();
                    expect(tk.state).toBe(Ticker.STOPPED);
                });
            });

            describe ('after calling ticker.start', function() {
                it ('should return Ticker.TICKING', function() {
                    tk.start();
                    expect(tk.state).toBe(Ticker.TICKING);
                });
            });
        });

        describe ('interval', function() {
            it ('should set the ticker models interval value', function() {
                tk.interval = 100;
                expect(tk.model.interval).toBe(100);
            });

            it ('should get the ticker models interval value', function() {
                tk.model.interval = 100;
                expect(tk.interval).toBe(100);
            });

            it ('should update the setInterval interval period', function() {
                spyOn(tk, 'tick');

                jasmine.clock().install();
                tk.start();
                jasmine.clock().tick(100);
                tk.interval = 100;
                jasmine.clock().tick(100);

                expect(tk.tick.calls.count()).toBe(3);
                jasmine.clock().uninstall();
            });

            it ('should create an new interval if the Ticker is TICKING', function() {
                spyOn(tk, 'createInterval');
                tk.start();
                tk.interval = 100;
                //
                expect(tk.createInterval.calls.count()).toBe(2);
            })

            it ('should not update the setInterval period if the Ticker is not TICKING', function() {
                spyOn(tk, 'createInterval');
                tk.start();
                tk.stop();
                tk.interval = 100;
                expect(tk.createInterval.calls.count()).toBe(1);
            });
        });
    });

    describe ('methods', function () {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        describe ('start', function () {
            it ('should be defined', function ( ){
                expect(tk.start).toBeDefined();
            });

            it ('should set the state variable to TICKING', function() {
                tk.start();
                expect(tk.state).toBe(Ticker.TICKING);
            });

            it ('should emit the START event', function () {
                spyOn(tk, 'emit');
                tk.start();
                expect(tk.emit).toHaveBeenCalledWith(TickerEvent.START);
            });

            it ('should call the tick method every (n)milliseconds based on the interval', function ( ) {
                spyOn(tk, 'tick');
                tk.start();
                jasmine.clock().tick(55);
                expect(tk.tick).toHaveBeenCalled();
            });
        });

        describe ('stop', function () {
            it ('should be defined', function ( ) {
                expect(tk.stop).toBeDefined();
            });

            it ('should change the state value to STOPPED', function() {
                tk.start();
                tk.stop();
                expect(tk.state).toBe(Ticker.STOPPED);
            });

            it ('should stop calling the tick method', function () {
                spyOn(tk, 'tick');
                tk.start();
                tk.stop();
                jasmine.clock().tick(55);
                expect(tk.tick).not.toHaveBeenCalled();
            });

            it ('should emit the STOP event', function () {
                spyOn(tk, 'emit');
                tk.stop();
                expect(tk.emit).toHaveBeenCalledWith(TickerEvent.STOP);
            });
        });

        describe ('tick', function () {
            it ('should broadcast the TICK event', function () {
                spyOn(tk, 'emit');
                tk.tick();
                expect(tk.emit).toHaveBeenCalledWith(TickerEvent.TICK);
            });
        });

        describe ('on', function () {
            it ('should be defined', function ( ) {
                expect(tk.on).toBeDefined();
            });
        });

        describe ('removeListener', function () {
            it ('should be defined', function () {
                expect(tk.removeListener).toBeDefined();
            });
        });
    });
});
