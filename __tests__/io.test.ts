import { Readable } from 'stream';
import { readInput } from '../src/io';

function feedStdin(text: string): void {
  const stream = new Readable({ read() { this.push(text); this.push(null); } });
  Object.defineProperty(process, 'stdin', { value: stream, configurable: true });
}

describe('readInput', () => {
  const originalStdin = process.stdin;
  afterEach(() => Object.defineProperty(process, 'stdin', { value: originalStdin, configurable: true }));

  it('returns trimmed non-empty lines', async () => {
    feedStdin('  100 3  \nPKG1 5 5 OFR001\n\n  PKG2 15 5 OFR002  \n');
    const lines = await readInput();
    expect(lines).toEqual(['100 3', 'PKG1 5 5 OFR001', 'PKG2 15 5 OFR002']);
  });

  it('returns empty array for empty input', async () => {
    feedStdin('');
    const lines = await readInput();
    expect(lines).toEqual([]);
  });
});
