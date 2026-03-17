import React, { memo } from 'react';
import { Box, Text } from 'ink';
import { colors } from './theme';
import { WelcomeScreen } from './WelcomeScreen';
import { HelpScreen } from './HelpScreen';
import { ResultCard } from './ResultCard';
import { ErrorDisplay } from './ErrorDisplay';
import type { CalculationResult } from '../types';

export type HistoryItem =
  | { type: 'welcome' }
  | { type: 'help' }
  | { type: 'input'; content: string }
  | { type: 'result'; data: CalculationResult }
  | { type: 'info'; content: string }
  | { type: 'error'; content: string }
  | { type: 'command'; content: string };

interface HistoryRendererProps {
  history: HistoryItem[];
  mode: 'cost' | 'time';
}

const HistoryEntry: React.FC<{ item: HistoryItem; mode: 'cost' | 'time' }> = memo(({ item, mode }) => {
  switch (item.type) {
    case 'welcome':
      return <WelcomeScreen mode={mode} />;
    case 'help':
      return <HelpScreen />;
    case 'input':
      return (
        <Box flexDirection="column" marginTop={1} marginBottom={1}>
          {item.content.split('\n').map((line, j) => (
            <Text key={j} color={colors.dimWhite}>{line}</Text>
          ))}
        </Box>
      );
    case 'result':
      return item.data.success ? (
        <Box marginTop={1} marginBottom={1}>
          <ResultCard mode={item.data.mode} results={item.data.results} renamedPackages={item.data.renamedPackages} />
        </Box>
      ) : (
        <Box marginTop={1} marginBottom={1}>
          <ErrorDisplay error={item.data.error} />
        </Box>
      );
    case 'info':
      return (
        <Box marginTop={1} marginBottom={1}>
          <Text color={colors.cyan}>ℹ {item.content}</Text>
        </Box>
      );
    case 'error':
      return (
        <Box marginTop={1} marginBottom={1}>
          <ErrorDisplay error={item.content} />
        </Box>
      );
    case 'command':
      return (
        <Box marginBottom={1}>
          <Text color={colors.muted}>❯ {item.content}</Text>
        </Box>
      );
    default:
      return null;
  }
});

export const HistoryRenderer: React.FC<HistoryRendererProps> = memo(({ history, mode }) => (
  <>
    {history.map((item, i) => (
      <HistoryEntry key={i} item={item} mode={mode} />
    ))}
  </>
));
