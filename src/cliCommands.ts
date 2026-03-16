export type CommandAction =
  | { type: 'change_mode'; mode: 'cost' | 'time' }
  | { type: 'connect'; url?: string }
  | { type: 'disconnect' }
  | { type: 'clear' }
  | { type: 'help' }
  | { type: 'restart' }
  | { type: 'exit' }
  | null;

export function processCommand(input: string): CommandAction {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'exit' || lower === 'quit') {
    return { type: 'exit' };
  }

  if (lower === 'clear') {
    return { type: 'clear' };
  }

  if (lower === 'help') {
    return { type: 'help' };
  }

  if (lower === '/restart') {
    return { type: 'restart' };
  }

  if (lower === '/disconnect') {
    return { type: 'disconnect' };
  }

  if (lower.startsWith('/connect')) {
    const parts = trimmed.split(/\s+/);
    const url = parts.length > 1 ? parts[1] : undefined;
    return { type: 'connect', url };
  }

  if (lower.startsWith('/change mode')) {
    const parts = trimmed.split(/\s+/);
    const mode = parts[2]?.toLowerCase();
    if (mode === 'cost' || mode === 'time') {
      return { type: 'change_mode', mode };
    }
    return null;
  }

  return null;
}

export function isCommand(input: string): boolean {
  return processCommand(input) !== null;
}
