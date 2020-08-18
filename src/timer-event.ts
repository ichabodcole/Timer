import { TimerTickData } from "./timer-tick-data";

export interface TimerEvent {
  type: string;
  data?: TimerTickData;
}
