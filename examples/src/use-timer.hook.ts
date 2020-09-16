import { Timer, TimerEvent, TimerEventTypes, TimerTickData } from "@/.";
import { useEffect, useState } from "preact/hooks";

interface TimerHook {
  timeData: TimerTickData;
  handleTimerStart: () => void;
  handleTimerStop: () => void;
  handleTimerReset: () => void;
}

export function useTimer(timer: Timer): TimerHook {
  const [timeData, setTimeData] = useState({
    duration: 0,
    progress: 0,
    timeElapsed: 0,
  });

  useEffect(() => {
    timer.on(TimerEventTypes.START, (event: TimerEvent) =>
      console.log(`Timer: ${event.type}`),
    );

    timer.on(TimerEventTypes.STOP, (event: TimerEvent) =>
      console.log(`Timer: ${event.type}`),
    );

    timer.on(TimerEventTypes.TICK, handleTick);
  }, []);

  function handleTick(event: TimerEvent): void {
    console.log(`Timer: ${event.type}, ${JSON.stringify(event.data)}`);

    if (event.data) {
      setTimeData(event.data);
    }
  }

  function handleTimerStart(): void {
    timer.start();
  }

  function handleTimerStop(): void {
    timer.stop();
  }

  function handleTimerReset(): void {
    timer.reset();
    setTimeData({
      duration: 0,
      progress: 0,
      timeElapsed: 0,
    });
  }

  return {
    timeData,
    handleTimerStart,
    handleTimerStop,
    handleTimerReset,
  };
}
