export type CommandAction =
  | { type: 'change_mode'; mode: 'cost' | 'time' }
  | { type: 'clear' }
  | { type: 'help' }
  | { type: 'exit' }
  | { type: 'error'; message: string }
  | null;

const TEXT_COMMANDS = ['clear', 'help', 'exit', 'quit'];
const SLASH_COMMANDS = ['/change'];

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1]
        ? prev
        : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
}

function findSimilarCommand(input: string, commands: string[]): string | null {
  let bestMatch = '';
  let bestDistance = Infinity;
  for (const cmd of commands) {
    const dist = levenshtein(input, cmd);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestMatch = cmd;
    }
  }
  if (bestDistance > 0 && bestDistance <= 2 && input.length >= bestMatch.length / 2) {
    return bestMatch;
  }
  return null;
}

export function processCommand(input: string): CommandAction {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'clear') {
    return { type: 'clear' };
  }

  if (lower === 'help') {
    return { type: 'help' };
  }

  if (lower === 'exit' || lower === 'quit') {
    return { type: 'exit' };
  }

  if (lower.startsWith('/change mode')) {
    const parts = trimmed.split(/\s+/);
    const mode = parts[2]?.toLowerCase();
    if (mode === 'cost' || mode === 'time') {
      return { type: 'change_mode', mode };
    }
    return { type: 'error', message: 'Usage: /change mode cost | time' };
  }

  if (lower.startsWith('/change')) {
    return { type: 'error', message: 'Usage: /change mode cost | time' };
  }

  if (lower.startsWith('/')) {
    const suggestion = findSimilarCommand(lower, SLASH_COMMANDS);
    if (suggestion) {
      return { type: 'error', message: `Unknown command "${trimmed}". Did you mean "${suggestion}"?` };
    }
    return { type: 'error', message: `Unknown command "${trimmed}". Type "help" for available commands` };
  }

  const suggestion = findSimilarCommand(lower, TEXT_COMMANDS);
  if (suggestion) {
    return { type: 'error', message: `Unknown command "${trimmed}". Did you mean "${suggestion}"?` };
  }

  return null;
}
