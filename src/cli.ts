import { Command } from 'commander';

/**
 * Query the terminal's actual background color via OSC 11 escape sequence.
 * Works through Docker/SSH because the host terminal responds to the query.
 */
function queryTerminalBackground(): Promise<'light' | 'dark' | null> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return Promise.resolve(null);

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      cleanup();
      resolve(null);
    }, 1000);

    const wasRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let buf = '';
    const onData = (chunk: string) => {
      buf += chunk;
      // Response: \033]11;rgb:RRRR/GGGG/BBBB\033\\ or \007
      const match = buf.match(/\]11;rgb:([0-9a-fA-F]+)\/([0-9a-fA-F]+)\/([0-9a-fA-F]+)/);
      if (match) {
        clearTimeout(timeout);
        cleanup();
        // Values can be 2 or 4 hex digits; take the first 2 for 0-255 range
        const r = parseInt(match[1].substring(0, 2), 16);
        const g = parseInt(match[2].substring(0, 2), 16);
        const b = parseInt(match[3].substring(0, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        resolve(luminance > 0.5 ? 'light' : 'dark');
      }
    };

    function cleanup() {
      process.stdin.removeListener('data', onData);
      process.stdin.setRawMode(wasRaw);
      process.stdin.pause();
    }

    process.stdin.on('data', onData);
    // OSC 11 query — asks the terminal for its background color
    process.stdout.write('\x1b]11;?\x07');
  });
}

const program = new Command()
  .name('courier-service')
  .description('Courier Service CLI')
  .version('1.0.0');

program
  .command('interactive', { isDefault: true })
  .description('Launch interactive TUI mode')
  .option('--api-url <url>', 'API server URL', 'http://localhost:3000')
  .option('--local', 'Use local calculations only (no API)')
  .option('--theme <scheme>', 'Color scheme: light or dark (auto-detected by default)')
  .action(async (opts) => {
    if (opts.theme) {
      process.env['COURIER_THEME'] = opts.theme;
    }

    // Auto-detect terminal background if no explicit theme set
    if (!process.env['COURIER_THEME']) {
      const detected = await queryTerminalBackground();
      if (detected) {
        process.env['COURIER_THEME'] = detected;
      }
    }

    const [React, { render }, { App }] = await Promise.all([
      import('react'),
      import('ink'),
      import('./ui/App'),
    ]);
    render(
      React.createElement(App, {
        initialApiUrl: opts.local ? undefined : opts.apiUrl,
        localOnly: opts.local,
      }),
      { exitOnCtrlC: false },
    );
  });

program.parseAsync().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
