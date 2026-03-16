import React from 'react';
import { Box, Text } from 'ink';
import { colors } from './theme';

export const HelpScreen: React.FC = () => (
  <Box flexDirection="column" marginBottom={1}>
    <Text color={colors.cyan}>Available Commands:</Text>
    <Text>  <Text color={colors.emerald}>/change mode</Text> <Text color={colors.muted}>cost | time</Text> <Text color={colors.muted}>- Switch calculation mode</Text></Text>
    <Text>  <Text color={colors.amber}>clear</Text> <Text color={colors.muted}>- Clear screen</Text></Text>
    <Text>  <Text color={colors.cyan}>/restart</Text> <Text color={colors.muted}>- Show welcome screen again</Text></Text>
    <Text>  <Text color={colors.cyan}>help</Text> <Text color={colors.muted}>- Show available commands</Text></Text>
    <Text>  <Text color={colors.muted}>↑ / ↓</Text> <Text color={colors.muted}>- Navigate command history</Text></Text>
    <Text>  <Text color={colors.muted}>Ctrl+C</Text> <Text color={colors.muted}>- Cancel current input</Text></Text>
  </Box>
);
