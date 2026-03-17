import chalk from 'chalk';

interface ColorPalette {
  pink: string;
  pinkBright: string;
  emerald: string;
  red: string;
  cyan: string;
  amber: string;
  muted: string;
  white: string;
  dimWhite: string;
  purple: string;
}

const darkColors: ColorPalette = {
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
};

// Always use dark color scheme — CLI is designed for a dark background
export const colors: ColorPalette = { ...darkColors };

export function getColorScheme(): 'dark' {
  return 'dark';
}

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
};
