import { Command } from 'commander';
import React from 'react';
import { render } from 'ink';
import { App } from './ui/App';

const program = new Command()
  .name('courier-service')
  .description('Courier Service CLI')
  .version('1.0.0');

program
  .command('interactive', { isDefault: true })
  .description('Launch interactive TUI mode')
  .option('--api-url <url>', 'API server URL', 'http://localhost:3000')
  .option('--local', 'Use local calculations only (no API)')
  .action((opts) => {
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
