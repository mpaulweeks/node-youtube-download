import prompt from 'prompt';

export async function asyncMap<T, V>(arr: T[], cb: (elm: T) => Promise<V>) {
  const out: V[] = [];
  for (const elm of arr) {
    const value = await cb(elm);
    out.push(value);
  }
  return out;
}

export function stripTrailingSlash(path: string): string {
  while (path.length && path.slice(-1) === '/') {
    path = path.slice(0, -1);
  }
  return path;
}

export async function cliPrompt(query: string): Promise<string> {
  prompt.start();
  const { confirm } = await prompt.get({
    properties: {
      confirm: {
        message: query,
      },
    },
  });
  return typeof confirm === 'string' ? confirm : '';
}

export async function cliConfirm(
  toConfirm: string | string[] | object,
): Promise<boolean> {
  // todo pretty print
  console.log(toConfirm);
  const confirm = await cliPrompt('confirm? y/n');
  return confirm === 'y';
}

export function outPath(filename: string) {
  return `${__dirname}/../../out/${filename}`;
}

export function range(n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    out.push(i);
  }
  return out;
}

export function sleep(n: number) {
  return new Promise(resolve => setTimeout(resolve, n));
}

export function getArrayArgs() {
  const { argv } = process;
  const index = argv.findIndex(arg => arg.endsWith('.ts') || arg.endsWith('.js'));
  const args = argv.slice(index + 1);
  return args;
}
