import React from 'react';
import { Box, Text } from 'ink';
import { colors } from './theme';

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  const lines = error.split('\n').filter(Boolean);

  return (
    <Box borderStyle="round" borderColor={colors.red} paddingX={2} paddingY={1} flexDirection="column" marginBottom={1}>
      <Text color={colors.red} bold>Error</Text>
      <Box marginTop={1} flexDirection="column">
        {lines.map((line, i) => (
          <Text key={i} color={colors.red}>
            {lines.length > 1 ? `• ${line}` : line}
          </Text>
        ))}
      </Box>
    </Box>
  );
};
