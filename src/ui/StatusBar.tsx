import React from 'react';
import { Box, Text } from 'ink';
import { colors } from './theme';

interface StatusBarProps {
  mode: 'cost' | 'time';
  apiUrl: string | null;
  transitCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ mode, apiUrl, transitCount }) => (
  <Box marginBottom={1}>
    <Text>
      <Text color={colors.muted}>Mode: </Text>
      <Text color={mode === 'cost' ? colors.pink : colors.cyan} bold>
        {mode}
      </Text>
      <Text color={colors.muted}> │ API: </Text>
      {apiUrl ? (
        <Text color={colors.emerald}>connected</Text>
      ) : (
        <Text color={colors.muted}>local only</Text>
      )}
      {transitCount > 0 && (
        <Text>
          <Text color={colors.muted}> │ </Text>
          <Text color={colors.amber}>📦 {transitCount} in transit</Text>
        </Text>
      )}
    </Text>
  </Box>
);
