import React from 'react';
import { Box, Text } from 'ink';
import { colors } from './theme';
import type { PackageResult } from '../cliCalculationRunner';

interface ResultCardProps {
  mode: 'cost' | 'time';
  results: PackageResult[];
  renamedPackages?: { oldId: string; newId: string }[];
}

const PackageRow: React.FC<{ result: PackageResult; mode: 'cost' | 'time'; renamedFrom?: string }> = ({ result, mode, renamedFrom }) => {
  const discountPercent = result.deliveryCost > 0
    ? ((result.discount / result.deliveryCost) * 100).toFixed(0)
    : '0';

  return (
    <Box flexDirection="column">
      {result.undeliverable && (
        <Box flexDirection="column">
          <Text color={colors.amber}>📦 In Transit</Text>
          <Text color={colors.amber}>⚠ {result.undeliverableReason || 'Package cannot be delivered'}</Text>
        </Box>
      )}

      {mode === 'time' && !result.undeliverable && result.deliveryRound != null && result.vehicleId != null && (
        <Box flexDirection="column">
          <Text color={colors.muted}>Packages Remaining: <Text color={colors.dimWhite}>{result.packagesRemaining ?? 0}</Text></Text>
          <Text>
            <Text color={colors.purple}>Delivery Round: <Text bold>{result.deliveryRound}</Text></Text>
            <Text color={colors.muted}> | </Text>
            <Text color={colors.cyan}>Vehicle Available: <Text bold>Vehicle{result.vehicleId}</Text></Text>
            <Text color={colors.muted}> | </Text>
            <Text color={colors.muted}>Current Time: <Text color={colors.dimWhite}>{(result.currentTime ?? 0).toFixed(2)} hrs</Text></Text>
          </Text>
          {result.vehicleReturnTime != null && (
            <Text color={colors.amber}>
              {result.currentTime != null && result.currentTime > 0
                ? `Vehicle${result.vehicleId} will be available after ${result.currentTime.toFixed(2)} + ${(result.roundTripTime ?? 0).toFixed(2)} = ${result.vehicleReturnTime.toFixed(2)} hrs`
                : `Vehicle${result.vehicleId} will be available after ${result.vehicleReturnTime.toFixed(2)} hrs`}
            </Text>
          )}
        </Box>
      )}

      <Box marginTop={1}>
        <Text color={colors.cyan} bold>{result.id}</Text>
        {renamedFrom && (
          <>
            <Text color={colors.muted}> (was </Text>
            <Text color={colors.muted} strikethrough>{renamedFrom}</Text>
            <Text color={colors.muted}>) </Text>
            <Text color={colors.purple}>Notified</Text>
          </>
        )}
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        {result.baseCost > 0 && (
          <>
            <Text>
              <Text color={colors.dimWhite}>Base Cost: {result.baseCost}</Text>
              <Text color={colors.muted}> | </Text>
              <Text color={colors.dimWhite}>Weight: {result.weight}kg</Text>
              <Text color={colors.muted}> | </Text>
              <Text color={colors.dimWhite}>Distance: {result.distance}km</Text>
            </Text>
            {result.offerCode && (
              <Text>
                <Text color={colors.dimWhite}>Offer: </Text>
                <Text color={colors.emerald}>{result.offerCode.toUpperCase()}</Text>
              </Text>
            )}
            <Text>
              <Text color={colors.dimWhite}>Delivery Cost: </Text>
              <Text color={colors.muted}>
                {result.baseCost} + ({result.weight} × 10) + ({result.distance} × 5) = </Text>
              <Text color={colors.dimWhite}>{result.deliveryCost}</Text>
            </Text>
          </>
        )}

        <Text>
          <Text color={colors.dimWhite}>Discount: </Text>
          {result.discount > 0 ? (
            <Text color={colors.emerald}>{result.discount} <Text color={colors.muted}>({discountPercent}% of {result.deliveryCost})</Text></Text>
          ) : (
            <Text color={colors.muted}>{result.offerCode ? 'Offer not applicable' : 'No offer code'} (0)</Text>
          )}
        </Text>

        <Text>
          <Text color={colors.pink} bold>Total Cost: {result.totalCost}</Text>
        </Text>

        {mode === 'time' && (
          <Text>
            <Text color={colors.dimWhite}>Delivery Time: </Text>
            {result.undeliverable ? (
              <Text color={colors.muted}>N/A</Text>
            ) : result.deliveryTime != null ? (
              <><Text color={colors.cyan} bold>{result.deliveryTime.toFixed(2)}</Text><Text color={colors.muted}> hrs</Text></>
            ) : (
              <Text color={colors.muted}>N/A</Text>
            )}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export const ResultCard: React.FC<ResultCardProps> = ({ mode, results, renamedPackages }) => {
  const renamedMap = new Map<string, string>();
  if (renamedPackages) {
    renamedPackages.forEach(({ oldId, newId }) => renamedMap.set(newId, oldId));
  }

  return (
    <Box flexDirection="column">
      <Text color={colors.muted}>─────────────────────────────────────────</Text>
      {results.map((r) => (
        <PackageRow
          key={r.id}
          result={r}
          mode={mode}
          renamedFrom={renamedMap.get(r.id)}
        />
      ))}
      <Text color={colors.muted}>─────────────────────────────────────────</Text>
    </Box>
  );
};
