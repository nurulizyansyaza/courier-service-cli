import React, { useState, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from './theme';
import { getCursorLinePosition, splitPastedInput, resetInputState } from '../inputHelpers';

interface InputPromptProps {
  mode: 'cost' | 'time';
  isCollecting: boolean;
  currentLine: number;
  expectedLines: number | null;
  collectedLines: string[];
  onSubmit: (value: string) => void;
  onCancel: () => void;
  onEditLine?: (index: number, value: string) => void;
  onPaste?: (lines: string[]) => void;
  history: string[];
  transitCount: number;
}

// Helpers that update both state and ref atomically
function syncSet<T>(setter: React.Dispatch<React.SetStateAction<T>>, ref: React.MutableRefObject<T>, val: T) {
  setter(val);
  ref.current = val;
}

export const InputPrompt: React.FC<InputPromptProps> = ({
  mode,
  isCollecting,
  currentLine,
  expectedLines,
  collectedLines,
  onSubmit,
  onCancel,
  onEditLine,
  onPaste,
  history,
  transitCount,
}) => {
  const [value, setValue] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draft, setDraft] = useState('');
  const [editingLineIndex, setEditingLineIndex] = useState(-1);

  const valueRef = useRef(value);
  valueRef.current = value;
  const cursorPosRef = useRef(cursorPos);
  cursorPosRef.current = cursorPos;
  const historyIndexRef = useRef(historyIndex);
  historyIndexRef.current = historyIndex;
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const editingLineIndexRef = useRef(editingLineIndex);
  editingLineIndexRef.current = editingLineIndex;
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;
  const onEditLineRef = useRef(onEditLine);
  onEditLineRef.current = onEditLine;
  const onPasteRef = useRef(onPaste);
  onPasteRef.current = onPaste;
  const historyRef = useRef(history);
  historyRef.current = history;
  const isCollectingRef = useRef(isCollecting);
  isCollectingRef.current = isCollecting;
  const collectedLinesRef = useRef(collectedLines);
  collectedLinesRef.current = collectedLines;

  const resetState = () => {
    const s = resetInputState();
    syncSet(setValue, valueRef, s.value);
    syncSet(setCursorPos, cursorPosRef, s.cursorPos);
    syncSet(setHistoryIndex, historyIndexRef, s.historyIndex);
    syncSet(setDraft, draftRef, s.draft);
    syncSet(setEditingLineIndex, editingLineIndexRef, s.editingLineIndex);
  };

  const setValueAndCursor = (val: string, pos: number) => {
    syncSet(setValue, valueRef, val);
    syncSet(setCursorPos, cursorPosRef, pos);
  };

  const navigateToCollectedLine = (idx: number) => {
    const lineVal = collectedLinesRef.current[idx];
    syncSet(setEditingLineIndex, editingLineIndexRef, idx);
    setValueAndCursor(lineVal, lineVal.length);
  };

  const saveDraftAndNavigate = (currentValue: string, idx: number) => {
    syncSet(setDraft, draftRef, currentValue);
    navigateToCollectedLine(idx);
  };

  const commitEditAndNavigate = (currentValue: string, currentIdx: number, nextIdx: number) => {
    if (currentValue !== collectedLinesRef.current[currentIdx] && onEditLineRef.current) {
      onEditLineRef.current(currentIdx, currentValue);
    }
    navigateToCollectedLine(nextIdx);
  };

  const returnToDraft = () => {
    const d = draftRef.current;
    syncSet(setEditingLineIndex, editingLineIndexRef, -1);
    setValueAndCursor(d, d.length);
  };

  const handleCancel = () => {
    resetState();
    onCancelRef.current();
  };

  const handleReturn = (currentValue: string, currentEditingIndex: number) => {
    if (currentEditingIndex >= 0 && onEditLineRef.current) {
      onEditLineRef.current(currentEditingIndex, currentValue);
      syncSet(setEditingLineIndex, editingLineIndexRef, -1);
    } else {
      onSubmitRef.current(currentValue);
    }
    syncSet(setValue, valueRef, '');
    syncSet(setCursorPos, cursorPosRef, 0);
    syncSet(setHistoryIndex, historyIndexRef, -1);
    syncSet(setDraft, draftRef, '');
  };

  const handleLeftArrow = (
    currentValue: string, cursor: number, currentEditingIndex: number, collecting: boolean, collected: string[]
  ) => {
    if (collecting && cursor === 0 && collected.length > 0) {
      if (currentEditingIndex === -1) {
        saveDraftAndNavigate(currentValue, collected.length - 1);
      } else if (currentEditingIndex > 0) {
        commitEditAndNavigate(currentValue, currentEditingIndex, currentEditingIndex - 1);
      }
      return;
    }
    syncSet(setCursorPos, cursorPosRef, Math.max(0, cursor - 1));
  };

  const handleRightArrow = (
    currentValue: string, cursor: number, currentEditingIndex: number, collecting: boolean, collected: string[]
  ) => {
    if (collecting && currentEditingIndex >= 0 && cursor >= currentValue.length) {
      if (currentValue !== collected[currentEditingIndex] && onEditLineRef.current) {
        onEditLineRef.current(currentEditingIndex, currentValue);
      }
      if (currentEditingIndex < collected.length - 1) {
        navigateToCollectedLine(currentEditingIndex + 1);
        syncSet(setCursorPos, cursorPosRef, 0);
      } else {
        returnToDraft();
        syncSet(setCursorPos, cursorPosRef, 0);
      }
      return;
    }
    syncSet(setCursorPos, cursorPosRef, Math.min(currentValue.length, cursor + 1));
  };

  const handleUpArrow = (
    currentValue: string, cursor: number, currentEditingIndex: number,
    collecting: boolean, collected: string[],
    currentHistoryIndex: number, currentHistory: string[]
  ) => {
    if (collecting && collected.length > 0) {
      if (currentEditingIndex === -1) {
        saveDraftAndNavigate(currentValue, collected.length - 1);
      } else if (currentEditingIndex > 0) {
        commitEditAndNavigate(currentValue, currentEditingIndex, currentEditingIndex - 1);
      }
      return;
    }
    // Multiline text navigation
    if (currentValue.includes('\n')) {
      const { lineIndex, colInLine } = getCursorLinePosition(currentValue, cursor);
      if (lineIndex > 0) {
        const lines = currentValue.split('\n');
        const prevLine = lines[lineIndex - 1];
        const newCol = Math.min(colInLine, prevLine.length);
        let newPos = 0;
        for (let i = 0; i < lineIndex - 1; i++) newPos += lines[i].length + 1;
        newPos += newCol;
        syncSet(setCursorPos, cursorPosRef, newPos);
        return;
      }
    }
    // Command history navigation
    if (currentHistory.length > 0) {
      const newIndex = currentHistoryIndex === -1
        ? currentHistory.length - 1
        : Math.max(0, currentHistoryIndex - 1);
      if (currentHistoryIndex === -1) {
        syncSet(setDraft, draftRef, currentValue);
      }
      syncSet(setHistoryIndex, historyIndexRef, newIndex);
      const histVal = currentHistory[newIndex];
      setValueAndCursor(histVal, histVal.length);
    }
  };

  const handleDownArrow = (
    currentValue: string, cursor: number, currentEditingIndex: number,
    collecting: boolean, collected: string[],
    currentHistoryIndex: number, currentHistory: string[]
  ) => {
    if (collecting && currentEditingIndex >= 0) {
      if (currentValue !== collected[currentEditingIndex] && onEditLineRef.current) {
        onEditLineRef.current(currentEditingIndex, currentValue);
      }
      if (currentEditingIndex >= collected.length - 1) {
        returnToDraft();
      } else {
        navigateToCollectedLine(currentEditingIndex + 1);
      }
      return;
    }
    // Multiline text navigation
    if (currentValue.includes('\n')) {
      const lines = currentValue.split('\n');
      const { lineIndex, colInLine } = getCursorLinePosition(currentValue, cursor);
      if (lineIndex < lines.length - 1) {
        const nextLine = lines[lineIndex + 1];
        const newCol = Math.min(colInLine, nextLine.length);
        let newPos = 0;
        for (let i = 0; i <= lineIndex; i++) newPos += lines[i].length + 1;
        newPos += newCol;
        syncSet(setCursorPos, cursorPosRef, newPos);
        return;
      }
    }
    // Command history navigation
    if (currentHistoryIndex !== -1) {
      const newIndex = currentHistoryIndex + 1;
      if (newIndex >= currentHistory.length) {
        syncSet(setHistoryIndex, historyIndexRef, -1);
        const d = draftRef.current;
        setValueAndCursor(d, d.length);
      } else {
        syncSet(setHistoryIndex, historyIndexRef, newIndex);
        const histVal = currentHistory[newIndex];
        setValueAndCursor(histVal, histVal.length);
      }
    }
  };

  const handleTextInput = (input: string, currentValue: string, cursor: number) => {
    // Detect pasted multiline input
    if (input.includes('\r') || input.includes('\n')) {
      const lines = splitPastedInput(input, currentValue);
      if (lines.length > 0 && onPasteRef.current) {
        onPasteRef.current(lines);
        resetState();
        return;
      }
    }
    const newVal = currentValue.slice(0, cursor) + input + currentValue.slice(cursor);
    setValueAndCursor(newVal, cursor + input.length);
  };

  useInput((input, key) => {
    const currentValue = valueRef.current;
    const cursor = cursorPosRef.current;
    const currentHistoryIndex = historyIndexRef.current;
    const currentEditingIndex = editingLineIndexRef.current;
    const collecting = isCollectingRef.current;
    const collected = collectedLinesRef.current;
    const currentHistory = historyRef.current;

    if (key.ctrl && input === 'c') { handleCancel(); return; }
    if (key.return) { handleReturn(currentValue, currentEditingIndex); return; }
    if (key.leftArrow) { handleLeftArrow(currentValue, cursor, currentEditingIndex, collecting, collected); return; }
    if (key.rightArrow) { handleRightArrow(currentValue, cursor, currentEditingIndex, collecting, collected); return; }
    if (key.upArrow) { handleUpArrow(currentValue, cursor, currentEditingIndex, collecting, collected, currentHistoryIndex, currentHistory); return; }
    if (key.downArrow) { handleDownArrow(currentValue, cursor, currentEditingIndex, collecting, collected, currentHistoryIndex, currentHistory); return; }

    if (key.backspace || key.delete) {
      if (cursor > 0) {
        const newVal = currentValue.slice(0, cursor - 1) + currentValue.slice(cursor);
        setValueAndCursor(newVal, cursor - 1);
      }
      return;
    }

    if (key.escape) { resetState(); return; }
    if (key.ctrl || key.meta || key.tab) return;

    if (input) { handleTextInput(input, currentValue, cursor); }
  });

  const modeColor = mode === 'cost' ? colors.pink : colors.cyan;
  const modeLabel = mode === 'cost' ? 'Cost' : 'Time';

  const allLines = value.split('\n');
  const { lineIndex: cursorLineIndex, colInLine: cursorPosInLine } = getCursorLinePosition(value, cursorPos);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={colors.muted}>──────────────────────────────────────────────────────────────────────────────────</Text>
      </Box>

      <Box marginBottom={1}>
        <Text>
          <Text color={colors.muted}>Mode: </Text>
          <Text color={modeColor}>{modeLabel}</Text>
          {transitCount > 0 && (
            <Text>
              <Text color={colors.muted}> │ </Text>
              <Text color={colors.amber}>📦 {transitCount} in transit</Text>
            </Text>
          )}
        </Text>
      </Box>

      {isCollecting && collectedLines.map((line, i) => (
        <Box key={i}>
          {i === editingLineIndex ? (
            <>
              <Text color={colors.pink}>{'❯ '}</Text>
              <Text>{value.slice(0, cursorPosInLine)}</Text>
              <Text inverse>{cursorPosInLine < value.length ? value[cursorPosInLine] : ' '}</Text>
              <Text>{value.slice(cursorPosInLine + 1)}</Text>
            </>
          ) : (
            <Text color={colors.dimWhite}>
              {'  '}{line}
            </Text>
          )}
        </Box>
      ))}

      {!isCollecting && allLines.length > 1 && allLines.map((line, i) => (
        <Box key={i}>
          {i === cursorLineIndex ? (
            <>
              <Text color={colors.pink}>{'❯ '}</Text>
              <Text>{line.slice(0, cursorPosInLine)}</Text>
              <Text inverse>{cursorPosInLine < line.length ? line[cursorPosInLine] : ' '}</Text>
              <Text>{line.slice(cursorPosInLine + 1)}</Text>
            </>
          ) : (
            <Text color={colors.dimWhite}>  {line}</Text>
          )}
        </Box>
      ))}

      {((isCollecting && editingLineIndex === -1) || (!isCollecting && allLines.length === 1)) && (
        <Box>
          <Text color={colors.pink}>{'❯ '}</Text>
          <Text>{value.slice(0, cursorPosInLine)}</Text>
          <Text inverse>{cursorPosInLine < value.length ? value[cursorPosInLine] : ' '}</Text>
          <Text>{value.slice(cursorPosInLine + 1)}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color={colors.muted}>
          Enter to submit • ←/→ move cursor • ↑/↓ {isCollecting ? 'edit lines' : 'history'} • Ctrl+C cancel
        </Text>
      </Box>
    </Box>
  );
};
