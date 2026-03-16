import React, { useState, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from './theme';

interface InputPromptProps {
  mode: 'cost' | 'time';
  isCollecting: boolean;
  currentLine: number;
  expectedLines: number | null;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  history: string[];
}

export const InputPrompt: React.FC<InputPromptProps> = ({
  mode,
  isCollecting,
  currentLine,
  expectedLines,
  onSubmit,
  onCancel,
  history,
}) => {
  const [value, setValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draft, setDraft] = useState('');

  // Use refs to avoid stale closures in useInput callback
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

    // Ctrl+C — cancel current multi-line collection or clear input
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

    // Enter — submit
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

    // Up arrow — navigate history
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

    // Down arrow — navigate history
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

    // Backspace — delete last character
    if (key.backspace || key.delete) {
      const newVal = currentValue.slice(0, -1);
      setValue(newVal);
      valueRef.current = newVal;
      return;
    }

    // Escape — clear input
    if (key.escape) {
      setValue('');
      valueRef.current = '';
      setHistoryIndex(-1);
      historyIndexRef.current = -1;
      setDraft('');
      draftRef.current = '';
      return;
    }

    // Ignore other control/meta keys
    if (key.ctrl || key.meta) return;
    if (key.upArrow || key.downArrow || key.leftArrow || key.rightArrow) return;
    if (key.tab) return;

    // Regular character input
    if (input) {
      const newVal = currentValue + input;
      setValue(newVal);
      valueRef.current = newVal;
    }
  });

  const modeColor = mode === 'cost' ? colors.pink : colors.cyan;

  // For multi-line history entries, show first line + indicator
  const displayValue = value.includes('\n')
    ? `${value.split('\n')[0]} ... (${value.split('\n').length} lines)`
    : value;

  if (isCollecting) {
    const lineLabel = expectedLines
      ? `Line ${currentLine}/${expectedLines}`
      : `Line ${currentLine}`;

    return (
      <Box>
        <Text color={colors.muted}>{lineLabel} </Text>
        <Text color={modeColor}>❯ </Text>
        <Text>{displayValue}</Text>
        <Text color={colors.muted}>█</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={modeColor} bold>[{mode}]</Text>
        <Text color={modeColor}> ❯ </Text>
        <Text>{displayValue}</Text>
        <Text color={colors.muted}>█</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={colors.muted}>Press Enter to execute • ↑/↓ history • Ctrl+C cancel</Text>
      </Box>
    </Box>
  );
};
