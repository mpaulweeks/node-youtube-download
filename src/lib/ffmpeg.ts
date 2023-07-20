// https://github.com/fent/node-ytdl-core/blob/master/example/ffmpeg.js

/**
 * Reencode audio & video without creating files first
 *
 * Requirements: ffmpeg, ether via a manual installation or via ffmpeg-static
 *
 * If you need more complex features like an output-stream you can check the older, more complex example:
 * https://github.com/fent/node-ytdl-core/blob/cc6720f9387088d6253acc71c8a49000544d4d2a/example/ffmpeg.js
 */

import cp from 'child_process';
import ffmpeg from 'ffmpeg-static';

import { ProgressBar } from './progressBar';

export function FFMPEG(args: {
  audio: NodeJS.ReadableStream;
  video: NodeJS.ReadableStream;
  destinationFile: string;
}): Promise<void> {
  if (!ffmpeg) {
    throw new Error('ffmpeg not defined');
  }
  const ffmpegPath = ffmpeg!;

  const progressBar = new ProgressBar();
  const {
    audio,
    video,
    destinationFile,
  } = args;

  audio.on('progress', (_, downloaded, total) => {
    progressBar.tracker.audio = { downloaded, total };
  });
  video.on('progress', (_, downloaded, total) => {
    progressBar.tracker.video = { downloaded, total };
  });

  // Start the ffmpeg child process
  const ffmpegProcess = cp.spawn(ffmpegPath, [
    // Remove ffmpeg's console spamming
    '-loglevel', '8', '-hide_banner',
    // Redirect/Enable progress messages
    '-progress', 'pipe:3',
    // Set inputs
    '-i', 'pipe:4',
    '-i', 'pipe:5',
    // Map audio & video from streams
    '-map', '0:a',
    '-map', '1:v',
    // Keep encoding
    '-c:v', 'copy',
    // Define output file
    destinationFile,
  ], {
    windowsHide: true,
    stdio: [
      /* Standard: stdin, stdout, stderr */
      'inherit', 'inherit', 'inherit',
      /* Custom: pipe:3, pipe:4, pipe:5 */
      'pipe', 'pipe', 'pipe',
    ],
  });
  const promise = new Promise<void>(resolve => {
    ffmpegProcess.on('close', () => {
      console.log('done');
      // Cleanup
      process.stdout.write('\n\n\n\n');
      progressBar.stop();
      resolve();
    });
  });

  // Link streams
  // FFmpeg creates the transformer streams and we just have to insert / read data
  const stdio = ffmpegProcess.stdio as NodeJS.ReadableStream[];
  stdio[3].on('data', (chunk: Buffer) => {
    // Start the progress bar
    progressBar.start();
    // Parse the param=value list returned by ffmpeg
    const lines = chunk.toString().trim().split('\n');
    const args: Record<string, string> = {};
    for (const l of lines) {
      const [key, value] = l.split('=');
      args[key.trim()] = value.trim();
    }
    progressBar.tracker.merged = args as any;
  });
  audio.pipe(stdio[4] as any);
  video.pipe(stdio[5] as any);

  return promise;
}
