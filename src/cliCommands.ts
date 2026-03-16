export type CommandAction =
  | { type: 'change_mode'; mode: 'cost' | 'time' }
  | { type: 'clear' }
  | { type: 'help' }
  | { type: 'exit' }
  | null;

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
    return null;
  }

  return null;
}
