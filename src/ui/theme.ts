import chalk from 'chalk';

export const colors = {
  pink: '#f472b6',
  pinkBright: '#ec4899',
  emerald: '#34d399',
  red: '#f87171',
  cyan: '#22d3ee',
  amber: '#fbbf24',
  muted: '#9ca3af',
  white: '#fafafa',
  dimWhite: '#d4d4d8',
  purple: '#a78bfa',
} as const;

export const theme = {
  prompt: chalk.hex(colors.pink),
  command: chalk.hex(colors.emerald),
  error: chalk.hex(colors.red),
  info: chalk.hex(colors.cyan),
  warning: chalk.hex(colors.amber),
  muted: chalk.hex(colors.muted),
  success: chalk.hex(colors.emerald),
  packageId: chalk.hex(colors.cyan).bold,
  cost: chalk.hex(colors.pink).bold,
  time: chalk.hex(colors.cyan).bold,
  label: chalk.hex(colors.dimWhite),
  value: chalk.hex(colors.white),
  heading: chalk.hex(colors.pink).bold,
  border: chalk.hex(colors.pink),
} as const;
