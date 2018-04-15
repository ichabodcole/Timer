Timer JS
==========

A simple event based timer.

### Installation

    npm install @ichabodcole/timer
    yarn add @ichabodcole/timer

### Basic Usage

    const {
      Timer,
      TimerEvent,
      TimerState
    } = require('@ichabodcole/timer')

    const duration = 5000 // A 5 second timer
    const updateInterval = 100 // default is 50

    var timer = new Timer(duration, updateInterval);

    timer.on(TimerEvent.TICK, e ==> {
        console.log(
            e.duration, // The timer duration
            e.timeElapsed, // The amount of time that has elapsed
            e.progress // The timer progress as a value from 0..1
        );
    });

    timer.on(TimerEvent.COMPLETE, () => {
        console.log('YAY!')
    })

    // Events include START, STOP, TICK, RESET, COMPLETE

    // Start the timer ticking
    timer.start();

    // The timer can be stopped at any point, which will freeze
    // the current time values
    // Calling start again will continue from the point
    // the timer was stopped
    timer.stop();

    // Reset the timer to start from the beginning
    timer.reset();

    // The time duration and progression values
    // can be updated while the timer is running
    timer.duration = 7000
    timer.timeElapsed = 3500
    timer.progress = 0.5
