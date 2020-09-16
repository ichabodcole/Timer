export class MockDateNow {
  private realDateNow = Date.now.bind(global.Date);
  private startTime = 0;

  constructor(time?: number) {
    if (typeof time === "number") {
      this.setStartTime(time);
    }
  }

  setStartTime(value: number): void {
    this.startTime = value;
    global.Date.now = jest.fn(() => value);
  }

  advanceTime(value: number): void {
    global.Date.now = jest.fn(() => {
      return this.startTime + value;
    });
  }

  reset(): void {
    global.Date.now = this.realDateNow;
  }
}
