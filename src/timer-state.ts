export const TimerStates = {
  TICKING: "TICKING",
  STOPPED: "STOPPED",
} as const;

export type TimerState = keyof typeof TimerStates;
