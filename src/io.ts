import * as readline from 'readline';

export function readInput(): Promise<string[]> {
  return new Promise(resolve => {
    const lines: string[] = [];
    const rl = readline.createInterface({ input: process.stdin });
    rl.on('line', line => { if (line.trim()) lines.push(line.trim()); });
    rl.on('close', () => resolve(lines));
  });
}
