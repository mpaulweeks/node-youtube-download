// https://github.com/fent/node-ytdl-core/blob/master/example/ffmpeg.js

import readline from 'readline';

export class ProgressBar {
  public tracker = this.defaultTracker;
  public start() {
    if (!this.progressbarHandle) {
      this.tracker = this.defaultTracker;
      this.progressbarHandle = setInterval(() => this.showProgress(), this.progressbarInterval);
    }
  }
  public stop() {
    clearInterval(this.progressbarHandle);
    this.progressbarHandle = undefined;
  }

  private get defaultTracker() {
    return {
      start: Date.now(),
      audio: { downloaded: 0, total: Infinity },
      video: { downloaded: 0, total: Infinity },
      merged: { frame: 0, speed: '0x', fps: 0 },
    };
  }
  private progressbarHandle: NodeJS.Timer | undefined;
  private progressbarInterval = 1000;
  private showProgress() {
    readline.cursorTo(process.stdout, 0);
    const toMB = (i: number) => (i / 1024 / 1024).toFixed(2);
    const { tracker } = this;

    process.stdout.write(`Audio  | ${(tracker.audio.downloaded / tracker.audio.total * 100).toFixed(2)}% processed `);
    process.stdout.write(`(${toMB(tracker.audio.downloaded)}MB of ${toMB(tracker.audio.total)}MB).${' '.repeat(10)}\n`);

    process.stdout.write(`Video  | ${(tracker.video.downloaded / tracker.video.total * 100).toFixed(2)}% processed `);
    process.stdout.write(`(${toMB(tracker.video.downloaded)}MB of ${toMB(tracker.video.total)}MB).${' '.repeat(10)}\n`);

    process.stdout.write(`Merged | processing frame ${tracker.merged.frame} `);
    process.stdout.write(`(at ${tracker.merged.fps} fps => ${tracker.merged.speed}).${' '.repeat(10)}\n`);

    process.stdout.write(`running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(2)} Minutes.`);
    readline.moveCursor(process.stdout, 0, -3);
  };
}
