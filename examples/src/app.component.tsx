import { h } from "preact";
import { Timer } from "@/timer";
import { useTimer } from "./use-timer.hook";
const timer = new Timer(60000);

export const App = (): h.JSX.Element => {
  const {
    handleTimerStart,
    handleTimerStop,
    handleTimerReset,
    timeData,
  } = useTimer(timer);

  return (
    <div>
      <h1>Timer</h1>
      <p>
        A simple event based timer, so you know when you're doing, what you're
        doing.
      </p>
      <div class="control-group">
        <button onClick={handleTimerStart}>Timer: Start</button>
        <button onClick={handleTimerStop}>Timer: Stop</button>
        <button onClick={handleTimerReset}>Timer: Reset</button>
      </div>
      <div class="control-group">
        <ul>
          <li>Time duration: {timeData.duration}</li>
          <li>Time progress: {timeData.progress.toFixed(2)}</li>
          <li>Time timeElapsed: {timeData.timeElapsed}</li>
        </ul>
      </div>
    </div>
  );
};
