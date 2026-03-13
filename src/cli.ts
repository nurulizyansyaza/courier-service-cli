import { Command } from 'commander';
import { readInput } from './io';
import { runCost, runDelivery } from './commands';

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
  .action(async () => {
    const lines = await readInput();
    runDelivery(lines);
  });

program.parseAsync().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
