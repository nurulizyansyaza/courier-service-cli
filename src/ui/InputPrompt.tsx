import React, { useState, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from './theme';

interface InputPromptProps {
  mode: 'cost' | 'time';
  isCollecting: boolean;
  currentLine: number;
  expectedLines: number | null;
  collectedLines: string[];
  onSubmit: (value: string) => void;
  onCancel: () => void;
  onEditLine?: (index: number, value: string) => void;
  history: string[];
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
  history,
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
  const historyRef = useRef(history);
  historyRef.current = history;
  const isCollectingRef = useRef(isCollecting);
  isCollectingRef.current = isCollecting;
  const collectedLinesRef = useRef(collectedLines);
  collectedLinesRef.current = collectedLines;

  useInput((input, key) => {
    const currentValue = valueRef.current;
    const cursor = cursorPosRef.current;
    const currentHistoryIndex = historyIndexRef.current;
    const currentDraft = draftRef.current;
    const currentHistory = historyRef.current;
    const currentEditingIndex = editingLineIndexRef.current;
    const collecting = isCollectingRef.current;
    const collected = collectedLinesRef.current;

    if (key.ctrl && input === 'c') {
      setValue('');
      valueRef.current = '';
      setCursorPos(0);
      cursorPosRef.current = 0;
      setHistoryIndex(-1);
      historyIndexRef.current = -1;
      setDraft('');
      draftRef.current = '';
      setEditingLineIndex(-1);
      editingLineIndexRef.current = -1;
      onCancelRef.current();
      return;
    }

    if (key.return) {
      const submitted = currentValue;
      if (currentEditingIndex >= 0 && onEditLineRef.current) {
        onEditLineRef.current(currentEditingIndex, submitted);
        setEditingLineIndex(-1);
        editingLineIndexRef.current = -1;
      } else {
        onSubmitRef.current(submitted);
      }
      setValue('');
      valueRef.current = '';
      setCursorPos(0);
      cursorPosRef.current = 0;
      setHistoryIndex(-1);
      historyIndexRef.current = -1;
      setDraft('');
      draftRef.current = '';
      return;
    }

    if (key.leftArrow) {
      if (collecting && cursor === 0 && collected.length > 0) {
        if (currentEditingIndex === -1) {
          setDraft(currentValue);
          draftRef.current = currentValue;
          const idx = collected.length - 1;
          setEditingLineIndex(idx);
          editingLineIndexRef.current = idx;
          const lineVal = collected[idx];
          setValue(lineVal);
          valueRef.current = lineVal;
          setCursorPos(lineVal.length);
          cursorPosRef.current = lineVal.length;
        } else if (currentEditingIndex > 0) {
          if (currentValue !== collected[currentEditingIndex] && onEditLineRef.current) {
            onEditLineRef.current(currentEditingIndex, currentValue);
          }
          const idx = currentEditingIndex - 1;
          setEditingLineIndex(idx);
          editingLineIndexRef.current = idx;
          const lineVal = collected[idx];
          setValue(lineVal);
          valueRef.current = lineVal;
          setCursorPos(lineVal.length);
          cursorPosRef.current = lineVal.length;
        }
        return;
      }
      const newPos = Math.max(0, cursor - 1);
      setCursorPos(newPos);
      cursorPosRef.current = newPos;
      return;
    }

    if (key.rightArrow) {
      if (collecting && currentEditingIndex >= 0 && cursor >= currentValue.length) {
        if (currentValue !== collected[currentEditingIndex] && onEditLineRef.current) {
          onEditLineRef.current(currentEditingIndex, currentValue);
        }
        if (currentEditingIndex < collected.length - 1) {
          const idx = currentEditingIndex + 1;
          setEditingLineIndex(idx);
          editingLineIndexRef.current = idx;
          const lineVal = collected[idx];
          setValue(lineVal);
          valueRef.current = lineVal;
          setCursorPos(0);
          cursorPosRef.current = 0;
        } else {
          setEditingLineIndex(-1);
          editingLineIndexRef.current = -1;
          setValue(currentDraft);
          valueRef.current = currentDraft;
          setCursorPos(0);
          cursorPosRef.current = 0;
        }
        return;
      }
      const newPos = Math.min(currentValue.length, cursor + 1);
      setCursorPos(newPos);
      cursorPosRef.current = newPos;
      return;
    }

    if (key.upArrow) {
      if (collecting && collected.length > 0) {
        if (currentEditingIndex === -1) {
          setDraft(currentValue);
          draftRef.current = currentValue;
          const idx = collected.length - 1;
          setEditingLineIndex(idx);
          editingLineIndexRef.current = idx;
          const lineVal = collected[idx];
          setValue(lineVal);
          valueRef.current = lineVal;
          setCursorPos(lineVal.length);
          cursorPosRef.current = lineVal.length;
        } else if (currentEditingIndex > 0) {
          if (currentValue !== collected[currentEditingIndex] && onEditLineRef.current) {
            onEditLineRef.current(currentEditingIndex, currentValue);
          }
          const idx = currentEditingIndex - 1;
          setEditingLineIndex(idx);
          editingLineIndexRef.current = idx;
          const lineVal = collected[idx];
          setValue(lineVal);
          valueRef.current = lineVal;
          setCursorPos(lineVal.length);
          cursorPosRef.current = lineVal.length;
        }
        return;
      }
      if (currentValue.includes('\n')) {
        const lines = currentValue.split('\n');
        let charCount = 0;
        let cursorLine = 0;
        let col = cursor;
        for (let i = 0; i < lines.length; i++) {
          if (cursor <= charCount + lines[i].length) {
            cursorLine = i;
            col = cursor - charCount;
            break;
          }
          charCount += lines[i].length + 1;
        }
        if (cursorLine > 0) {
          const prevLine = lines[cursorLine - 1];
          const newCol = Math.min(col, prevLine.length);
          let newPos = 0;
          for (let i = 0; i < cursorLine - 1; i++) {
            newPos += lines[i].length + 1;
          }
          newPos += newCol;
          setCursorPos(newPos);
          cursorPosRef.current = newPos;
          return;
        }
      }
      if (currentHistory.length > 0) {
        const newIndex = currentHistoryIndex === -1
          ? currentHistory.length - 1
          : Math.max(0, currentHistoryIndex - 1);
        if (currentHistoryIndex === -1) {
          setDraft(currentValue);
          draftRef.current = currentValue;
        }
        setHistoryIndex(newIndex);
        historyIndexRef.current = newIndex;
        const histVal = currentHistory[newIndex];
        setValue(histVal);
        valueRef.current = histVal;
        setCursorPos(histVal.length);
        cursorPosRef.current = histVal.length;
      }
      return;
    }

    if (key.downArrow) {
      if (collecting && currentEditingIndex >= 0) {
        if (currentValue !== collected[currentEditingIndex] && onEditLineRef.current) {
          onEditLineRef.current(currentEditingIndex, currentValue);
        }
        if (currentEditingIndex >= collected.length - 1) {
          setEditingLineIndex(-1);
          editingLineIndexRef.current = -1;
          setValue(currentDraft);
          valueRef.current = currentDraft;
          setCursorPos(currentDraft.length);
          cursorPosRef.current = currentDraft.length;
        } else {
          const idx = currentEditingIndex + 1;
          setEditingLineIndex(idx);
          editingLineIndexRef.current = idx;
          const lineVal = collected[idx];
          setValue(lineVal);
          valueRef.current = lineVal;
          setCursorPos(lineVal.length);
          cursorPosRef.current = lineVal.length;
        }
        return;
      }
      if (currentValue.includes('\n')) {
        const lines = currentValue.split('\n');
        let charCount = 0;
        let cursorLine = 0;
        let col = cursor;
        for (let i = 0; i < lines.length; i++) {
          if (cursor <= charCount + lines[i].length) {
            cursorLine = i;
            col = cursor - charCount;
            break;
          }
          charCount += lines[i].length + 1;
        }
        if (cursorLine < lines.length - 1) {
          const nextLine = lines[cursorLine + 1];
          const newCol = Math.min(col, nextLine.length);
          let newPos = 0;
          for (let i = 0; i <= cursorLine; i++) {
            newPos += lines[i].length + 1;
          }
          newPos += newCol;
          setCursorPos(newPos);
          cursorPosRef.current = newPos;
          return;
        }
      }
      if (currentHistoryIndex !== -1) {
        const newIndex = currentHistoryIndex + 1;
        if (newIndex >= currentHistory.length) {
          setHistoryIndex(-1);
          historyIndexRef.current = -1;
          setValue(currentDraft);
          valueRef.current = currentDraft;
          setCursorPos(currentDraft.length);
          cursorPosRef.current = currentDraft.length;
        } else {
          setHistoryIndex(newIndex);
          historyIndexRef.current = newIndex;
          const histVal = currentHistory[newIndex];
          setValue(histVal);
          valueRef.current = histVal;
          setCursorPos(histVal.length);
          cursorPosRef.current = histVal.length;
        }
      }
      return;
    }

    if (key.backspace || key.delete) {
      if (cursor > 0) {
        const newVal = currentValue.slice(0, cursor - 1) + currentValue.slice(cursor);
        setValue(newVal);
        valueRef.current = newVal;
        setCursorPos(cursor - 1);
        cursorPosRef.current = cursor - 1;
      }
      return;
    }

    if (key.escape) {
      setValue('');
      valueRef.current = '';
      setCursorPos(0);
      cursorPosRef.current = 0;
      setHistoryIndex(-1);
      historyIndexRef.current = -1;
      setDraft('');
      draftRef.current = '';
      setEditingLineIndex(-1);
      editingLineIndexRef.current = -1;
      return;
    }

    if (key.ctrl || key.meta) return;
    if (key.tab) return;

    if (input) {
      const newVal = currentValue.slice(0, cursor) + input + currentValue.slice(cursor);
      setValue(newVal);
      valueRef.current = newVal;
      const newPos = cursor + input.length;
      setCursorPos(newPos);
      cursorPosRef.current = newPos;
    }
  });

  const modeColor = mode === 'cost' ? colors.pink : colors.cyan;

  const allLines = value.split('\n');
  let cursorLineIndex = 0;
  let cursorPosInLine = cursorPos;
  if (allLines.length > 1) {
    let charCount = 0;
    for (let i = 0; i < allLines.length; i++) {
      if (cursorPos <= charCount + allLines[i].length) {
        cursorLineIndex = i;
        cursorPosInLine = cursorPos - charCount;
        break;
      }
      charCount += allLines[i].length + 1;
    }
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={colors.muted}>──────────────────────────────────────────────────────────────────────────────────</Text>
      </Box>

      {(isCollecting || editingLineIndex >= 0) && (
        <Box marginBottom={1}>
          <Text>
            {isCollecting && expectedLines && (
              <Text color={colors.muted}>Line {currentLine}/{expectedLines}</Text>
            )}
            {editingLineIndex >= 0 && (
              <Text color={colors.amber}>{isCollecting && expectedLines ? ' │ ' : ''}Editing line {editingLineIndex + 1}</Text>
            )}
          </Text>
        </Box>
      )}

      {isCollecting && collectedLines.map((line, i) => (
        <Box key={i}>
          {i === editingLineIndex ? (
            <>
              <Text color={modeColor}>{mode} </Text><Text color={colors.pink}>{'❯ '}</Text>
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
              <Text color={modeColor}>{mode} </Text><Text color={colors.pink}>{'❯ '}</Text>
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
          <Text color={modeColor}>{mode} </Text><Text color={colors.pink}>{'❯ '}</Text>
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
