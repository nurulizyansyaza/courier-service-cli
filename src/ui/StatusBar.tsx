import React from 'react';
import { Box, Text } from 'ink';
import { colors } from './theme';

interface StatusBarProps {
  mode: 'cost' | 'time';
  transitCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ mode, transitCount }) => (
  <Box marginBottom={1}>
    <Text>
      <Text color={colors.muted}>Mode: </Text>
      <Text color={mode === 'cost' ? colors.pink : colors.cyan} bold>
        {mode}
      </Text>
      {transitCount > 0 && (
        <Text>
          <Text color={colors.muted}> │ </Text>
          <Text color={colors.amber}>📦 {transitCount} in transit</Text>
        </Text>
      )}
    </Text>
  </Box>
);
