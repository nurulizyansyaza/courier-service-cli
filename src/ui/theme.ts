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

const lightColors: ColorPalette = {
  pink: '#be185d',
  pinkBright: '#9d174d',
  emerald: '#047857',
  red: '#b91c1c',
  cyan: '#0e7490',
  amber: '#b45309',
  muted: '#374151',
  white: '#111827',
  dimWhite: '#1f2937',
  purple: '#6d28d9',
};

export function detectColorScheme(): 'light' | 'dark' {
  const envTheme = process.env['COURIER_THEME']?.toLowerCase();
  if (envTheme === 'light') return 'light';
  if (envTheme === 'dark') return 'dark';

  // COLORFGBG is set by some terminals (xterm, rxvt, etc.) as "fg;bg"
  const colorfgbg = process.env['COLORFGBG'];
  if (colorfgbg) {
    const parts = colorfgbg.split(';');
    const bg = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(bg) && (bg >= 7 && bg <= 15)) return 'light';
  }

  return 'dark';
}

const scheme = detectColorScheme();

export const colors: ColorPalette = scheme === 'light' ? lightColors : darkColors;

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
