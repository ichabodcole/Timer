import { TickerEventTypes } from "@ichabodcole/ticker";

export const TimerEventTypes = {
  COMPLETE: "COMPLETE",
  RESET: "RESET",
  ...TickerEventTypes,
} as const;

export type TimerEventType = keyof typeof TimerEventTypes;
