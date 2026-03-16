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
    <Box flexDirection="column" marginBottom={1}>
      {/* Undeliverable banner */}
      {result.undeliverable && (
        <Text color={colors.amber}>  ⚠ {result.undeliverableReason || 'Package cannot be delivered'}</Text>
      )}

      {/* Vehicle/Round info header (time mode) */}
      {mode === 'time' && result.vehicleId != null && (
        <Box flexDirection="column">
          <Text color={colors.muted}>
            {'  '}Delivery Round {result.deliveryRound} • Vehicle {result.vehicleId}
            {result.packagesRemaining != null && ` • ${result.packagesRemaining} pkg remaining`}
          </Text>
          {result.currentTime != null && (
            <Text color={colors.muted}>
              {'  '}Current Time: {result.currentTime.toFixed(2)}hrs
              {result.vehicleReturnTime != null && ` • Return: ${result.vehicleReturnTime.toFixed(2)}hrs`}
              {result.roundTripTime != null && ` • Round Trip: ${result.roundTripTime.toFixed(2)}hrs`}
            </Text>
          )}
        </Box>
      )}

      {/* Package ID */}
      <Box>
        <Text color={colors.cyan} bold>  {result.id}</Text>
        {renamedFrom && (
          <Text color={colors.muted}> (was {renamedFrom})</Text>
        )}
      </Box>

      {/* Details */}
      <Box paddingLeft={4} flexDirection="column">
        {/* Base cost, Weight, Distance, Offer */}
        {result.baseCost > 0 && (
          <>
            <Text>
              <Text color={colors.dimWhite}>Base Cost: </Text>
              <Text color={colors.dimWhite}>{result.baseCost}</Text>
              <Text color={colors.muted}>{' | '}</Text>
              <Text color={colors.dimWhite}>Weight: </Text>
              <Text color={colors.dimWhite}>{result.weight}kg</Text>
              <Text color={colors.muted}>{' | '}</Text>
              <Text color={colors.dimWhite}>Distance: </Text>
              <Text color={colors.dimWhite}>{result.distance}km</Text>
            </Text>
            {result.offerCode && (
              <Text>
                <Text color={colors.dimWhite}>Offer: </Text>
                <Text color={colors.emerald}>{result.offerCode.toUpperCase()}</Text>
              </Text>
            )}

            {/* Delivery Cost formula */}
            <Text>
              <Text color={colors.dimWhite}>Delivery Cost: </Text>
              <Text color={colors.muted}>
                {result.baseCost} + ({result.weight} × 10) + ({result.distance} × 5) = </Text>
              <Text color={colors.dimWhite}>{result.deliveryCost}</Text>
            </Text>
          </>
        )}

        {/* Discount */}
        <Text>
          <Text color={colors.dimWhite}>Discount: </Text>
          {result.discount > 0 ? (
            <Text color={colors.emerald}>{result.discount} <Text color={colors.muted}>({discountPercent}% of {result.deliveryCost})</Text></Text>
          ) : (
            <Text color={colors.muted}>{result.offerCode ? 'Offer not applicable' : 'No offer code'} (0)</Text>
          )}
        </Text>

        {/* Total Cost */}
        <Text>
          <Text color={colors.pink} bold>Total Cost: {result.totalCost}</Text>
        </Text>

        {/* Delivery Time (time mode) */}
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
    <Box flexDirection="column" marginBottom={1}>
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
