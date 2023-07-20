const INSTRUCTIONS = `

  $ npm run youtube [url or slug, comma separated]

`
  .split('\n')
  .map(s => s.trim())
  .join('\n');

import ytdl from 'ytdl-core';
import { Timer } from './lib/timer';
import * as util from './lib/util';
import { FFMPEG } from './lib/ffmpeg';

interface Args {
  src: string;
}

interface YouTubeInfo {
  label: string;
  url: string;
}

export class YouTube {
  private parseArgs(): Args | undefined {
    const parsed = util.getArrayArgs();
    console.log('videos', parsed);
    const [src] = parsed;

    if (!src) {
      return undefined;
    }
    return { src, };
  }

  private normalizeUrl(raw: string): string {
    let vid = raw;
    if (raw.includes('?v=')) {
      vid = raw.split('?v=')[1].split('&')[0];
    } else if (raw.includes('youtu.be/')) {
      vid = raw.split('youtu.be/')[1].split('&')[0];
    }
    return `https://www.youtube.com/watch?v=${vid}`;
  }

  public async getLabel(url: string) {
    const info = await ytdl.getBasicInfo(url);
    return `${info.videoDetails.ownerChannelName} - ${info.videoDetails.title}`;
  }

  public download(args: YouTubeInfo) {
    const { label, url } = args;
    console.log('downloading:', label);
    const audio = ytdl(url, { quality: 'highestaudio' });
    const video = ytdl(url, { quality: 'highestvideo' });
    return FFMPEG({
      audio,
      video,
      destinationFile: util.outPath(`${label}.mkv`),
    })
  }

  async main() {
    const args = this.parseArgs();
    if (!args) {
      return console.log(INSTRUCTIONS);
    }

    console.log('looking up meta data...');
    const urls = args.src
      .split(',')
      .map(src => src.trim())
      .filter(src => !!src)
      .map(src => this.normalizeUrl(src));
    const infos = {
      success: [] as YouTubeInfo[],
      failed: [] as string[],
    }
    await util.asyncMap(urls, async url => {
      try {
        const label = await this.getLabel(url);
        infos.success.push({ label, url });
      } catch (err) {
        infos.failed.push(url);
      }
    });

    const confirm = await util.cliConfirm(infos);
    if (!confirm) {
      return console.log('aborted');
    }

    const timer = Timer.start();
    await util.asyncMap(infos.success, info => this.download(info));
    timer.log();
  }
}

new YouTube().main();
