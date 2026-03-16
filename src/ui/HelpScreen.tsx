import React from 'react';
import { Box, Text } from 'ink';
import { colors } from './theme';

export const HelpScreen: React.FC = () => (
  <Box borderStyle="round" borderColor={colors.pink} paddingX={2} paddingY={1} flexDirection="column">
    <Text color={colors.pink} bold>Available Commands</Text>
    <Box marginTop={1} flexDirection="column">
      <Text>
        <Text color={colors.emerald} bold>/change mode </Text>
        <Text color={colors.cyan}>cost</Text>
        <Text color={colors.muted}> | </Text>
        <Text color={colors.cyan}>time</Text>
        <Text color={colors.muted}>    Switch calculation mode</Text>
      </Text>
      <Text>
        <Text color={colors.emerald} bold>/connect </Text>
        <Text color={colors.cyan}>[url]</Text>
        <Text color={colors.muted}>           Connect to API server</Text>
      </Text>
      <Text>
        <Text color={colors.emerald} bold>/disconnect</Text>
        <Text color={colors.muted}>              Disconnect from API (local only)</Text>
      </Text>
      <Text>
        <Text color={colors.emerald} bold>clear</Text>
        <Text color={colors.muted}>                    Clear screen</Text>
      </Text>
      <Text>
        <Text color={colors.emerald} bold>/restart</Text>
        <Text color={colors.muted}>                 Show welcome screen</Text>
      </Text>
      <Text>
        <Text color={colors.emerald} bold>help</Text>
        <Text color={colors.muted}>                     Show this help</Text>
      </Text>
      <Text>
        <Text color={colors.emerald} bold>exit</Text>
        <Text color={colors.muted}>                     Exit CLI</Text>
      </Text>
      <Text> </Text>
      <Text>
        <Text color={colors.emerald} bold>↑ / ↓</Text>
        <Text color={colors.muted}>                   Navigate command history</Text>
      </Text>
      <Text>
        <Text color={colors.emerald} bold>Ctrl+C</Text>
        <Text color={colors.muted}>                   Cancel input / Exit</Text>
      </Text>
    </Box>
  </Box>
);
