import React from 'react';
import { Box, Text } from 'ink';
import { colors } from './theme';

interface StatusBarProps {
  mode: 'cost' | 'time';
  transitCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ mode, transitCount }) => (
  <>
    {transitCount > 0 && (
      <Box>
        <Text color={colors.amber}>📦 {transitCount} in transit</Text>
      </Box>
    )}
  </>
);
