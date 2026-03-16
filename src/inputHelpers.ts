export interface InputState {
  value: string;
  cursorPos: number;
  historyIndex: number;
  draft: string;
  editingLineIndex: number;
}

/** Calculate which line and column the cursor is on within multiline text */
export function getCursorLinePosition(
  text: string,
  cursorPos: number,
): { lineIndex: number; colInLine: number } {
  const lines = text.split('\n');
  if (lines.length <= 1) {
    return { lineIndex: 0, colInLine: cursorPos };
  }

  let charCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (cursorPos <= charCount + lines[i].length) {
      return { lineIndex: i, colInLine: cursorPos - charCount };
    }
    charCount += lines[i].length + 1;
  }

  const lastLine = lines.length - 1;
  return { lineIndex: lastLine, colInLine: lines[lastLine].length };
}

/** Split pasted multiline text into individual trimmed lines */
export function splitPastedInput(input: string, currentValue?: string): string[] {
  const rawLines = input.split(/\r?\n|\r/).filter(l => l.trim());
  if (rawLines.length === 0) return [];

  const current = currentValue?.trim() ?? '';
  const firstLine = current ? `${current} ${rawLines[0]}` : rawLines[0];
  const allLines = [firstLine, ...rawLines.slice(1)]
    .map(l => l.trim())
    .filter(Boolean);

  return allLines;
}

/** Return a clean initial InputState */
export function resetInputState(): InputState {
  return {
    value: '',
    cursorPos: 0,
    historyIndex: -1,
    draft: '',
    editingLineIndex: -1,
  };
}
