import { Command } from 'commander';
import { readInput } from './io';
import { runCost, runDelivery } from './commands';
import React from 'react';
import { render } from 'ink';
import { App } from './ui/App';

const program = new Command()
  .name('courier-service')
  .description('Courier Service CLI')
  .version('1.0.0');

program
  .command('cost')
  .description('Estimate delivery cost with offers (Problem 1)')
  .action(async () => {
    const lines = await readInput();
    runCost(lines);
  });

program
  .command('delivery')
  .description('Estimate delivery time and cost (Problem 2)')
  .option('--detailed', 'Show detailed output with vehicle/round info')
  .action(async (opts) => {
    const lines = await readInput();
    runDelivery(lines, opts.detailed);
  });

program
  .command('interactive')
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
