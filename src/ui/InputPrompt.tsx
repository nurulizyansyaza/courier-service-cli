import React, { useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from './theme';
import { getCursorLinePosition } from '../inputHelpers';
import { useInputState } from './useInputState';
import {
  handleCancel,
  handleReturn,
  handleLeftArrow,
  handleRightArrow,
  handleUpArrow,
  handleDownArrow,
  handleTextInput,
  handleBackspace,
  type InputHandlerDeps,
} from './inputHandlers';

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
  const state = useInputState();

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

  const deps: InputHandlerDeps = {
    valueRef: state.valueRef,
    cursorPosRef: state.cursorPosRef,
    historyIndexRef: state.historyIndexRef,
    draftRef: state.draftRef,
    editingLineIndexRef: state.editingLineIndexRef,
    isCollectingRef,
    collectedLinesRef,
    historyRef,
    onSubmitRef,
    onCancelRef,
    onEditLineRef,
    onPasteRef,
    setValueAndCursor: state.setValueAndCursor,
    setCursorPos: state.setCursorPos,
    setHistoryIndex: state.setHistoryIndex,
    setDraft: state.setDraft,
    setEditingLineIndex: state.setEditingLineIndex,
    resetState: state.resetState,
  };

  useInput((input, key) => {
    const currentValue = state.valueRef.current;
    const cursor = state.cursorPosRef.current;
    const currentHistoryIndex = state.historyIndexRef.current;
    const currentEditingIndex = state.editingLineIndexRef.current;
    const collecting = isCollectingRef.current;
    const collected = collectedLinesRef.current;
    const currentHistory = historyRef.current;

    if (key.ctrl && input === 'c') { handleCancel(deps); return; }
    if (key.return) { handleReturn(deps, currentValue, currentEditingIndex); return; }
    if (key.leftArrow) { handleLeftArrow(deps, currentValue, cursor, currentEditingIndex, collecting, collected); return; }
    if (key.rightArrow) { handleRightArrow(deps, currentValue, cursor, currentEditingIndex, collecting, collected); return; }
    if (key.upArrow) { handleUpArrow(deps, currentValue, cursor, currentEditingIndex, collecting, collected, currentHistoryIndex, currentHistory); return; }
    if (key.downArrow) { handleDownArrow(deps, currentValue, cursor, currentEditingIndex, collecting, collected, currentHistoryIndex, currentHistory); return; }

    if (key.backspace || key.delete) { handleBackspace(deps, currentValue, cursor); return; }
    if (key.escape) { state.resetState(); return; }
    if (key.ctrl || key.meta || key.tab) return;

    if (input) { handleTextInput(deps, input, currentValue, cursor); }
  });

  const modeColor = mode === 'cost' ? colors.pink : colors.cyan;
  const modeLabel = mode === 'cost' ? 'Cost' : 'Time';

  const allLines = state.value.split('\n');
  const { lineIndex: cursorLineIndex, colInLine: cursorPosInLine } = getCursorLinePosition(state.value, state.cursorPos);

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
          {i === state.editingLineIndex ? (
            <>
              <Text color={colors.pink}>{'❯ '}</Text>
              <Text>{state.value.slice(0, cursorPosInLine)}</Text>
              <Text inverse>{cursorPosInLine < state.value.length ? state.value[cursorPosInLine] : ' '}</Text>
              <Text>{state.value.slice(cursorPosInLine + 1)}</Text>
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

      {((isCollecting && state.editingLineIndex === -1) || (!isCollecting && allLines.length === 1)) && (
        <Box>
          <Text color={colors.pink}>{'❯ '}</Text>
          <Text>{state.value.slice(0, cursorPosInLine)}</Text>
          <Text inverse>{cursorPosInLine < state.value.length ? state.value[cursorPosInLine] : ' '}</Text>
          <Text>{state.value.slice(cursorPosInLine + 1)}</Text>
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
