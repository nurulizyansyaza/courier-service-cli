import React from 'react';
import { Box, Text } from 'ink';
import { colors } from './theme';
import type { CostResult, TimeResult } from '../cliCalculationRunner';

interface ResultCardProps {
  mode: 'cost' | 'time';
  results: CostResult[] | TimeResult[];
}

const CostRow: React.FC<{ result: CostResult }> = ({ result }) => (
  <Box flexDirection="column" marginBottom={1}>
    <Box>
      <Text color={colors.cyan} bold>{result.id}</Text>
    </Box>
    <Box paddingLeft={2} flexDirection="column">
      <Text>
        <Text color={colors.dimWhite}>Discount: </Text>
        {result.discount > 0 ? (
          <Text color={colors.emerald}>{result.discount}</Text>
        ) : (
          <Text color={colors.muted}>0</Text>
        )}
      </Text>
      <Text>
        <Text color={colors.dimWhite}>Total Cost: </Text>
        <Text color={colors.pink} bold>{result.totalCost}</Text>
      </Text>
    </Box>
  </Box>
);

const TimeRow: React.FC<{ result: TimeResult }> = ({ result }) => (
  <Box flexDirection="column" marginBottom={1}>
    <Box>
      <Text color={colors.cyan} bold>{result.id}</Text>
      {result.undeliverable && (
        <Text color={colors.amber}> ⚠ {result.undeliverableReason || 'Undeliverable'}</Text>
      )}
    </Box>
    <Box paddingLeft={2} flexDirection="column">
      <Text>
        <Text color={colors.dimWhite}>Discount: </Text>
        {result.discount > 0 ? (
          <Text color={colors.emerald}>{result.discount}</Text>
        ) : (
          <Text color={colors.muted}>0</Text>
        )}
      </Text>
      <Text>
        <Text color={colors.dimWhite}>Total Cost: </Text>
        <Text color={colors.pink} bold>{result.totalCost}</Text>
      </Text>
      {result.deliveryTime !== null && (
        <Text>
          <Text color={colors.dimWhite}>Delivery Time: </Text>
          <Text color={colors.cyan} bold>{result.deliveryTime.toFixed(2)}</Text>
          <Text color={colors.muted}> hrs</Text>
        </Text>
      )}
      {result.vehicleId && (
        <Text>
          <Text color={colors.dimWhite}>Vehicle: </Text>
          <Text color={colors.muted}>
            {result.vehicleId} (round {result.deliveryRound})
          </Text>
        </Text>
      )}
    </Box>
  </Box>
);

export const ResultCard: React.FC<ResultCardProps> = ({ mode, results }) => (
  <Box
    borderStyle="round"
    borderColor={mode === 'cost' ? colors.pink : colors.cyan}
    paddingX={2}
    paddingY={1}
    flexDirection="column"
    marginBottom={1}
  >
    <Text color={mode === 'cost' ? colors.pink : colors.cyan} bold>
      Results ({mode === 'cost' ? 'Cost' : 'Time'})
    </Text>
    <Box marginTop={1} flexDirection="column">
      {mode === 'cost'
        ? (results as CostResult[]).map((r) => <CostRow key={r.id} result={r} />)
        : (results as TimeResult[]).map((r) => <TimeRow key={r.id} result={r} />)}
    </Box>
  </Box>
);
