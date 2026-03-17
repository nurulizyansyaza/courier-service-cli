import { getCursorLinePosition, splitPastedInput } from '../inputHelpers';

export interface InputHandlerDeps {
  // Refs for synchronous access
  valueRef: React.MutableRefObject<string>;
  cursorPosRef: React.MutableRefObject<number>;
  historyIndexRef: React.MutableRefObject<number>;
  draftRef: React.MutableRefObject<string>;
  editingLineIndexRef: React.MutableRefObject<number>;
  isCollectingRef: React.MutableRefObject<boolean>;
  collectedLinesRef: React.MutableRefObject<string[]>;
  historyRef: React.MutableRefObject<string[]>;

  // Callback refs
  onSubmitRef: React.MutableRefObject<(value: string) => void>;
  onCancelRef: React.MutableRefObject<() => void>;
  onEditLineRef: React.MutableRefObject<((index: number, value: string) => void) | undefined>;
  onPasteRef: React.MutableRefObject<((lines: string[]) => void) | undefined>;

  // State setters
  setValueAndCursor: (val: string, pos: number) => void;
  setCursorPos: (pos: number) => void;
  setHistoryIndex: (idx: number) => void;
  setDraft: (d: string) => void;
  setEditingLineIndex: (idx: number) => void;
  resetState: () => void;
}

function navigateToCollectedLine(deps: InputHandlerDeps, idx: number) {
  const lineVal = deps.collectedLinesRef.current[idx];
  deps.setEditingLineIndex(idx);
  deps.setValueAndCursor(lineVal, lineVal.length);
}

function saveDraftAndNavigate(deps: InputHandlerDeps, currentValue: string, idx: number) {
  deps.setDraft(currentValue);
  navigateToCollectedLine(deps, idx);
}

function commitEditAndNavigate(deps: InputHandlerDeps, currentValue: string, currentIdx: number, nextIdx: number) {
  if (currentValue !== deps.collectedLinesRef.current[currentIdx] && deps.onEditLineRef.current) {
    deps.onEditLineRef.current(currentIdx, currentValue);
  }
  navigateToCollectedLine(deps, nextIdx);
}

function returnToDraft(deps: InputHandlerDeps) {
  const d = deps.draftRef.current;
  deps.setEditingLineIndex(-1);
  deps.setValueAndCursor(d, d.length);
}

export function handleCancel(deps: InputHandlerDeps) {
  deps.resetState();
  deps.onCancelRef.current();
}

export function handleReturn(deps: InputHandlerDeps, currentValue: string, currentEditingIndex: number) {
  if (currentEditingIndex >= 0 && deps.onEditLineRef.current) {
    deps.onEditLineRef.current(currentEditingIndex, currentValue);
    deps.setEditingLineIndex(-1);
  } else {
    deps.onSubmitRef.current(currentValue);
  }
  deps.setValueAndCursor('', 0);
  deps.setHistoryIndex(-1);
  deps.setDraft('');
}

export function handleLeftArrow(
  deps: InputHandlerDeps,
  currentValue: string, cursor: number, currentEditingIndex: number,
  collecting: boolean, collected: string[],
) {
  if (collecting && cursor === 0 && collected.length > 0) {
    if (currentEditingIndex === -1) {
      saveDraftAndNavigate(deps, currentValue, collected.length - 1);
    } else if (currentEditingIndex > 0) {
      commitEditAndNavigate(deps, currentValue, currentEditingIndex, currentEditingIndex - 1);
    }
    return;
  }
  deps.setCursorPos(Math.max(0, cursor - 1));
}

export function handleRightArrow(
  deps: InputHandlerDeps,
  currentValue: string, cursor: number, currentEditingIndex: number,
  collecting: boolean, collected: string[],
) {
  if (collecting && currentEditingIndex >= 0 && cursor >= currentValue.length) {
    if (currentValue !== collected[currentEditingIndex] && deps.onEditLineRef.current) {
      deps.onEditLineRef.current(currentEditingIndex, currentValue);
    }
    if (currentEditingIndex < collected.length - 1) {
      navigateToCollectedLine(deps, currentEditingIndex + 1);
      deps.setCursorPos(0);
    } else {
      returnToDraft(deps);
      deps.setCursorPos(0);
    }
    return;
  }
  deps.setCursorPos(Math.min(currentValue.length, cursor + 1));
}

export function handleUpArrow(
  deps: InputHandlerDeps,
  currentValue: string, cursor: number, currentEditingIndex: number,
  collecting: boolean, collected: string[],
  currentHistoryIndex: number, currentHistory: string[],
) {
  if (collecting && collected.length > 0) {
    if (currentEditingIndex === -1) {
      saveDraftAndNavigate(deps, currentValue, collected.length - 1);
    } else if (currentEditingIndex > 0) {
      commitEditAndNavigate(deps, currentValue, currentEditingIndex, currentEditingIndex - 1);
    }
    return;
  }
  if (currentValue.includes('\n')) {
    const { lineIndex, colInLine } = getCursorLinePosition(currentValue, cursor);
    if (lineIndex > 0) {
      const lines = currentValue.split('\n');
      const prevLine = lines[lineIndex - 1];
      const newCol = Math.min(colInLine, prevLine.length);
      let newPos = 0;
      for (let i = 0; i < lineIndex - 1; i++) newPos += lines[i].length + 1;
      newPos += newCol;
      deps.setCursorPos(newPos);
      return;
    }
  }
  if (currentHistory.length > 0) {
    const newIndex = currentHistoryIndex === -1
      ? currentHistory.length - 1
      : Math.max(0, currentHistoryIndex - 1);
    if (currentHistoryIndex === -1) {
      deps.setDraft(currentValue);
    }
    deps.setHistoryIndex(newIndex);
    const histVal = currentHistory[newIndex];
    deps.setValueAndCursor(histVal, histVal.length);
  }
}

export function handleDownArrow(
  deps: InputHandlerDeps,
  currentValue: string, cursor: number, currentEditingIndex: number,
  collecting: boolean, collected: string[],
  currentHistoryIndex: number, currentHistory: string[],
) {
  if (collecting && currentEditingIndex >= 0) {
    if (currentValue !== collected[currentEditingIndex] && deps.onEditLineRef.current) {
      deps.onEditLineRef.current(currentEditingIndex, currentValue);
    }
    if (currentEditingIndex >= collected.length - 1) {
      returnToDraft(deps);
    } else {
      navigateToCollectedLine(deps, currentEditingIndex + 1);
    }
    return;
  }
  if (currentValue.includes('\n')) {
    const lines = currentValue.split('\n');
    const { lineIndex, colInLine } = getCursorLinePosition(currentValue, cursor);
    if (lineIndex < lines.length - 1) {
      const nextLine = lines[lineIndex + 1];
      const newCol = Math.min(colInLine, nextLine.length);
      let newPos = 0;
      for (let i = 0; i <= lineIndex; i++) newPos += lines[i].length + 1;
      newPos += newCol;
      deps.setCursorPos(newPos);
      return;
    }
  }
  if (currentHistoryIndex !== -1) {
    const newIndex = currentHistoryIndex + 1;
    if (newIndex >= currentHistory.length) {
      deps.setHistoryIndex(-1);
      const d = deps.draftRef.current;
      deps.setValueAndCursor(d, d.length);
    } else {
      deps.setHistoryIndex(newIndex);
      const histVal = currentHistory[newIndex];
      deps.setValueAndCursor(histVal, histVal.length);
    }
  }
}

export function handleTextInput(
  deps: InputHandlerDeps,
  input: string, currentValue: string, cursor: number,
) {
  if (input.includes('\r') || input.includes('\n')) {
    // Single newline character (Shift+Enter) — insert as newline
    const stripped = input.replace(/\r/g, '\n');
    if (stripped === '\n') {
      const newVal = currentValue.slice(0, cursor) + '\n' + currentValue.slice(cursor);
      deps.setValueAndCursor(newVal, cursor + 1);
      return;
    }
    // Multi-line paste
    const lines = splitPastedInput(input, currentValue);
    if (lines.length > 0 && deps.onPasteRef.current) {
      deps.onPasteRef.current(lines);
      deps.resetState();
      return;
    }
  }
  const newVal = currentValue.slice(0, cursor) + input + currentValue.slice(cursor);
  deps.setValueAndCursor(newVal, cursor + input.length);
}

export function handleBackspace(deps: InputHandlerDeps, currentValue: string, cursor: number) {
  if (cursor > 0) {
    const newVal = currentValue.slice(0, cursor - 1) + currentValue.slice(cursor);
    deps.setValueAndCursor(newVal, cursor - 1);
  }
}
