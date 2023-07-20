export class Timer {
  constructor(readonly startedAt: number) {}

  log(message?: string) {
    const now = performance.now();
    const elapsed = Math.round(now - this.startedAt);
    console.log(message ? `${message} | ${elapsed} ms` : `took ${elapsed} ms`);
  }

  static start() {
    return new Timer(performance.now());
  }
}
