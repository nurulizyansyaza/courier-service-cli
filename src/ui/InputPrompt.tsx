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
  history,
  transitCount,
}) => {
  const [value, setValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draft, setDraft] = useState('');

  const valueRef = useRef(value);
  valueRef.current = value;
  const historyIndexRef = useRef(historyIndex);
  historyIndexRef.current = historyIndex;
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;
  const historyRef = useRef(history);
  historyRef.current = history;

  useInput((input, key) => {
    const currentValue = valueRef.current;
    const currentHistoryIndex = historyIndexRef.current;
    const currentDraft = draftRef.current;
    const currentHistory = historyRef.current;

    if (key.ctrl && input === 'c') {
      setValue('');
      valueRef.current = '';
      setHistoryIndex(-1);
      historyIndexRef.current = -1;
      setDraft('');
      draftRef.current = '';
      onCancelRef.current();
      return;
    }

    if (key.return) {
      const submitted = currentValue;
      setValue('');
      valueRef.current = '';
      setHistoryIndex(-1);
      historyIndexRef.current = -1;
      setDraft('');
      draftRef.current = '';
      onSubmitRef.current(submitted);
      return;
    }

    if (key.upArrow && currentHistory.length > 0) {
      const newIndex = currentHistoryIndex === -1
        ? currentHistory.length - 1
        : Math.max(0, currentHistoryIndex - 1);

      if (currentHistoryIndex === -1) {
        setDraft(currentValue);
        draftRef.current = currentValue;
      }
      setHistoryIndex(newIndex);
      historyIndexRef.current = newIndex;
      setValue(currentHistory[newIndex]);
      valueRef.current = currentHistory[newIndex];
      return;
    }

    if (key.downArrow && currentHistoryIndex !== -1) {
      const newIndex = currentHistoryIndex + 1;
      if (newIndex >= currentHistory.length) {
        setHistoryIndex(-1);
        historyIndexRef.current = -1;
        setValue(currentDraft);
        valueRef.current = currentDraft;
      } else {
        setHistoryIndex(newIndex);
        historyIndexRef.current = newIndex;
        setValue(currentHistory[newIndex]);
        valueRef.current = currentHistory[newIndex];
      }
      return;
    }

    if (key.backspace || key.delete) {
      const newVal = currentValue.slice(0, -1);
      setValue(newVal);
      valueRef.current = newVal;
      return;
    }

    if (key.escape) {
      setValue('');
      valueRef.current = '';
      setHistoryIndex(-1);
      historyIndexRef.current = -1;
      setDraft('');
      draftRef.current = '';
      return;
    }

    if (key.ctrl || key.meta) return;
    if (key.upArrow || key.downArrow || key.leftArrow || key.rightArrow) return;
    if (key.tab) return;

    if (input) {
      const newVal = currentValue + input;
      setValue(newVal);
      valueRef.current = newVal;
    }
  });

  const modeColor = mode === 'cost' ? colors.pink : colors.cyan;
  const modeLabel = mode === 'cost' ? 'Cost' : 'Time';

  const historyLines = value.includes('\n') ? value.split('\n') : null;

  return (
    <Box flexDirection="column">
      {/* Separator */}
      <Text color={colors.muted}>─────────────────────────────────────────</Text>

      {/* Status bar */}
      <Box>
        <Text color={colors.muted}>Mode: </Text>
        <Text color={modeColor}>{modeLabel}</Text>
        {isCollecting && expectedLines && (
          <Text color={colors.muted}> │ Line {currentLine}/{expectedLines}</Text>
        )}
        {transitCount > 0 && (
          <Text color={colors.muted}> │ Transit: </Text>
        )}
        {transitCount > 0 && (
          <Text color={colors.amber}>{transitCount}</Text>
        )}
      </Box>

      {/* Previously collected lines (during collection) */}
      {isCollecting && collectedLines.map((line, i) => (
        <Box key={i}>
          <Text color={colors.dimWhite}>  {line}</Text>
        </Box>
      ))}

      {/* Multi-line history recall — show all lines expanded */}
      {!isCollecting && historyLines && historyLines.slice(0, -1).map((line, i) => (
        <Box key={i}>
          <Text color={colors.dimWhite}>  {line}</Text>
        </Box>
      ))}

      {/* Active input line */}
      <Box>
        <Text color={colors.pink}>❯ </Text>
        <Text>{historyLines ? historyLines[historyLines.length - 1] : value}</Text>
        <Text color={colors.muted}>█</Text>
      </Box>

      {/* Hints */}
      <Box marginTop={1}>
        <Text color={colors.muted}>Enter to execute • ↑/↓ history • Ctrl+C cancel</Text>
      </Box>
    </Box>
  );
};
