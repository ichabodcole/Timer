Timer JS
==========

A simple event based timer.

### Installation

    npm install @ichabodcole/timer
    yarn add @ichabodcole/timer

### Basic Usage

    import {
      Timer,
      TimerEvent, { type: TimerEventType, data?: TimerTickData }
      TimerEventTypes,
      TimerStates
    } from '@ichabodcole/timer'

    const duration = 5000 // A 5 second timer
    const updateInterval = 100 // default is 50

    var timer = new Timer(duration, updateInterval);

    timer.on(TimerEvent.TICK, (e) => {
        console.log(
            e.type, // TICK
            e.data.duration, // The timer duration
            e.data.timeElapsed, // The amount of time that has elapsed
            e.data.progress // The timer progress as a value from 0..1
        );
    });

    timer.on(TimerEvent.COMPLETE, e => {
        console.log('YAY!', e.type)
    });

    // When the timer completes the COMPLETE, STOP, and RESET events 
    // will be emitted automatically in that order.

    // Events include START, STOP, TICK, RESET, COMPLETE

    // Start the timer ticking
    timer.start(); // Also timer.on(TimerEvent.START, ...

    // The timer can be stopped at any point, which will freeze
    // the current time values
    // Calling start again will continue from the point
    // the timer was stopped
    timer.stop(); // Also timer.on(TimerEvent.STOP, ...

    // Reset the timer to start from the beginning, this will happen on completion as well
    timer.reset(); // Also timer.on(TimerEvent.RESET, ...
    timer.start();

    // The time duration and progression values
    // can be updated while the timer is running
    // and the timer will adjust accordingly
    timer.duration = 7000
    timer.timeElapsed = 3500
    timer.progress = 0.5
