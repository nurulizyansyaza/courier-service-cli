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
  pink: '#9d174d',
  pinkBright: '#831843',
  emerald: '#065f46',
  red: '#991b1b',
  cyan: '#155e75',
  amber: '#92400e',
  muted: '#1f2937',
  white: '#030712',
  dimWhite: '#111827',
  purple: '#5b21b6',
};

export function detectColorScheme(): 'light' | 'dark' {
  const envTheme = process.env['COURIER_THEME']?.toLowerCase().trim();
  if (envTheme === 'light') return 'light';
  if (envTheme === 'dark') return 'dark';

  const colorfgbg = process.env['COLORFGBG'];
  if (colorfgbg) {
    const parts = colorfgbg.split(';');
    const bg = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(bg) && (bg >= 7 && bg <= 15)) return 'light';
  }

  return 'dark';
}

/**
 * Query the terminal's actual background color via OSC 11 escape sequence.
 * Works through Docker/SSH because the host terminal responds.
 * Returns null if the terminal doesn't respond within the timeout.
 */
export function queryTerminalBackground(timeoutMs = 1000): Promise<'light' | 'dark' | null> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return Promise.resolve(null);

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeoutMs);

    const wasRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let buf = '';
    const onData = (chunk: string) => {
      buf += chunk;
      const match = buf.match(/\]11;rgb:([0-9a-fA-F]+)\/([0-9a-fA-F]+)\/([0-9a-fA-F]+)/);
      if (match) {
        clearTimeout(timeout);
        cleanup();
        const r = parseInt(match[1].substring(0, 2), 16);
        const g = parseInt(match[2].substring(0, 2), 16);
        const b = parseInt(match[3].substring(0, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        resolve(luminance > 0.5 ? 'light' : 'dark');
      }
    };

    function cleanup() {
      process.stdin.removeListener('data', onData);
      try { process.stdin.setRawMode(wasRaw); } catch { /* ignore */ }
      process.stdin.pause();
    }

    process.stdin.on('data', onData);
    process.stdout.write('\x1b]11;?\x07');
  });
}

let currentScheme: 'light' | 'dark' = detectColorScheme();
let currentPalette: ColorPalette = currentScheme === 'light' ? lightColors : darkColors;

// Mutable colors object — all imports see updated values when scheme changes
export const colors: ColorPalette = { ...currentPalette };

export function setColorScheme(scheme: 'light' | 'dark'): void {
  if (scheme === currentScheme) return;
  currentScheme = scheme;
  currentPalette = scheme === 'light' ? lightColors : darkColors;
  Object.assign(colors, currentPalette);
  theme.prompt = chalk.hex(colors.pink);
  theme.command = chalk.hex(colors.emerald);
  theme.error = chalk.hex(colors.red);
  theme.info = chalk.hex(colors.cyan);
  theme.warning = chalk.hex(colors.amber);
  theme.muted = chalk.hex(colors.muted);
  theme.success = chalk.hex(colors.emerald);
  theme.packageId = chalk.hex(colors.cyan).bold;
  theme.cost = chalk.hex(colors.pink).bold;
  theme.time = chalk.hex(colors.cyan).bold;
  theme.label = chalk.hex(colors.dimWhite);
  theme.value = chalk.hex(colors.white);
  theme.heading = chalk.hex(colors.pink).bold;
  theme.border = chalk.hex(colors.pink);
}

export function getColorScheme(): 'light' | 'dark' {
  return currentScheme;
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
