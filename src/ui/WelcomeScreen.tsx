import React from 'react';
import { Box, Text } from 'ink';
import { colors } from './theme';

const MOTORCYCLE_ART = [
  '    __o',
  '  _ \\<_',
  ' (_)/(_)',
];

export const WelcomeScreen: React.FC = () => (
  <Box flexDirection="column" marginBottom={1}>
    <Box borderStyle="round" borderColor={colors.pink} paddingX={2} paddingY={1} flexDirection="column">
      <Box justifyContent="center" flexDirection="column">
        {MOTORCYCLE_ART.map((line, i) => (
          <Text key={i} color={colors.pink}>{line}</Text>
        ))}
      </Box>
      <Box marginTop={1} justifyContent="center">
        <Text color={colors.pink} bold>Courier Service CLI</Text>
      </Box>
      <Box justifyContent="center">
        <Text color={colors.muted}>Fast &amp; Reliable Delivery Cost Calculator</Text>
      </Box>
    </Box>

    <Box borderStyle="round" borderColor={colors.pink} paddingX={2} paddingY={1} flexDirection="column" marginTop={1}>
      <Text color={colors.pink} bold>Available Offers</Text>
      <Box marginTop={1} flexDirection="column">
        <Text>
          <Text color={colors.emerald} bold>OFR001</Text>
          <Text color={colors.muted}>  10% off  </Text>
          <Text color={colors.dimWhite}>Distance {'<'} 200km, Weight: 70-200kg</Text>
        </Text>
        <Text>
          <Text color={colors.emerald} bold>OFR002</Text>
          <Text color={colors.muted}>   7% off  </Text>
          <Text color={colors.dimWhite}>Distance: 50-150km, Weight: 100-250kg</Text>
        </Text>
        <Text>
          <Text color={colors.emerald} bold>OFR003</Text>
          <Text color={colors.muted}>   5% off  </Text>
          <Text color={colors.dimWhite}>Distance: 50-250km, Weight: 10-150kg</Text>
        </Text>
      </Box>
    </Box>

    <Box borderStyle="round" borderColor={colors.pink} paddingX={2} paddingY={1} flexDirection="column" marginTop={1}>
      <Text color={colors.pink} bold>Input Format</Text>
      <Box marginTop={1} flexDirection="column">
        <Text color={colors.dimWhite}>Cost Mode:</Text>
        <Text color={colors.muted}>  Line 1: base_delivery_cost no_of_packages</Text>
        <Text color={colors.muted}>  Line 2+: pkg_id weight distance offer_code</Text>
        <Text> </Text>
        <Text color={colors.dimWhite}>Time Mode:</Text>
        <Text color={colors.muted}>  Line 1: base_delivery_cost no_of_packages</Text>
        <Text color={colors.muted}>  Line 2+: pkg_id weight distance offer_code</Text>
        <Text color={colors.muted}>  Last:   no_of_vehicles max_speed max_weight</Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color={colors.dimWhite}>Example (cost):</Text>
        <Text color={colors.cyan}>  100 3</Text>
        <Text color={colors.cyan}>  PKG1 5 5 OFR001</Text>
        <Text color={colors.cyan}>  PKG2 15 5 OFR002</Text>
        <Text color={colors.cyan}>  PKG3 10 100 OFR003</Text>
      </Box>
    </Box>
  </Box>
);
