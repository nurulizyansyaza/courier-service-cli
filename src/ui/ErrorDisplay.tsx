import React from 'react';
import { Box, Text } from 'ink';
import { colors } from './theme';

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  const lines = error.split('\n').filter(Boolean);

  return (
    <Box paddingLeft={0} flexDirection="column" marginBottom={1}>
      {lines.map((line, i) => (
        <Text key={i} color={colors.red}>
          {lines.length > 1 ? `• ${line}` : line}
        </Text>
      ))}
    </Box>
  );
};
