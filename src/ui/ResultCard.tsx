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
        <Text color={colors.amber}>⚠ {result.undeliverableReason || 'Package cannot be delivered'}</Text>
      )}

      {mode === 'time' && result.vehicleId != null && (
        <Box flexDirection="column">
          <Text color={colors.muted}>
            Delivery Round {result.deliveryRound} • Vehicle {result.vehicleId}
            {result.packagesRemaining != null && ` • ${result.packagesRemaining} pkg remaining`}
          </Text>
          {result.currentTime != null && (
            <Text color={colors.muted}>
              Current Time: {result.currentTime.toFixed(2)}hrs
              {result.vehicleReturnTime != null && ` • Return: ${result.vehicleReturnTime.toFixed(2)}hrs`}
              {result.roundTripTime != null && ` • Round Trip: ${result.roundTripTime.toFixed(2)}hrs`}
            </Text>
          )}
        </Box>
      )}

      <Box>
        <Text color={colors.cyan} bold>{result.id}</Text>
        {renamedFrom && (
          <Text color={colors.muted}> (was {renamedFrom})</Text>
        )}
      </Box>

      <Box flexDirection="column" marginLeft={2}>
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

        {mode === 'time' && result.deliveryTime != null && (
          <Text>
            <Text color={colors.dimWhite}>Delivery Time: </Text>
            <Text color={colors.cyan} bold>{result.deliveryTime.toFixed(2)}</Text>
            <Text color={colors.muted}> hrs</Text>
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
