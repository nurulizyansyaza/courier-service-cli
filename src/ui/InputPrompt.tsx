import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { colors } from './theme';

interface InputPromptProps {
  mode: 'cost' | 'time';
  isCollecting: boolean;
  currentLine: number;
  expectedLines: number | null;
  onSubmit: (value: string) => void;
  history: string[];
}

export const InputPrompt: React.FC<InputPromptProps> = ({
  mode,
  isCollecting,
  currentLine,
  expectedLines,
  onSubmit,
  history,
}) => {
  const [value, setValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draft, setDraft] = useState('');

  const handleSubmit = useCallback((val: string) => {
    onSubmit(val);
    setValue('');
    setHistoryIndex(-1);
    setDraft('');
  }, [onSubmit]);

  useInput((input, key) => {
    if (key.upArrow && history.length > 0) {
      const newIndex = historyIndex === -1
        ? history.length - 1
        : Math.max(0, historyIndex - 1);

      if (historyIndex === -1) {
        setDraft(value);
      }
      setHistoryIndex(newIndex);
      setValue(history[newIndex]);
      return;
    }

    if (key.downArrow && historyIndex !== -1) {
      const newIndex = historyIndex + 1;
      if (newIndex >= history.length) {
        setHistoryIndex(-1);
        setValue(draft);
      } else {
        setHistoryIndex(newIndex);
        setValue(history[newIndex]);
      }
      return;
    }

    // Ctrl+C in ink is handled by useApp, but we reset input on escape
    if (key.escape) {
      setValue('');
      setHistoryIndex(-1);
      setDraft('');
    }
  });

  const modeColor = mode === 'cost' ? colors.pink : colors.cyan;

  if (isCollecting) {
    const lineLabel = expectedLines
      ? `Line ${currentLine}/${expectedLines}`
      : `Line ${currentLine}`;

    return (
      <Box>
        <Text color={colors.muted}>{lineLabel} </Text>
        <Text color={modeColor}>❯ </Text>
        <TextInput value={value} onChange={setValue} onSubmit={handleSubmit} />
      </Box>
    );
  }

  return (
    <Box>
      <Text color={modeColor} bold>[{mode}]</Text>
      <Text color={modeColor}> ❯ </Text>
      <TextInput value={value} onChange={setValue} onSubmit={handleSubmit} />
    </Box>
  );
};
