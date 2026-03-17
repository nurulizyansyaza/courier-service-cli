import {
  parseInput,
  calculatePackageCost,
  computeDeliveryResultsFromParsed,
  calculateDeliveryTimeWithTransit,
  type DetailedDeliveryResult,
  type TransitPackageInput,
} from '@nurulizyansyaza/courier-service-core';
import type { TransitPackage, CalculationResult } from './types';
import { mapCostResult, mapTimeResult } from './resultMapper';

export function runLocalCost(input: string): CalculationResult {
  const { baseCost, packages } = parseInput(input, 'cost');
  const results = packages.map(pkg => {
    const { discount, totalCost } = calculatePackageCost(pkg, baseCost);
    return mapCostResult(pkg, baseCost, discount, totalCost);
  });
  return { success: true, mode: 'cost', results };
}

export function runLocalTimeWithTransit(
  input: string,
  transitPackages: TransitPackage[],
): CalculationResult {
  const transitInputs: TransitPackageInput[] = transitPackages.map(t => ({
    id: t.id,
    weight: t.weight,
    distance: t.distance,
    offerCode: t.offerCode,
  }));
  const transitResult = calculateDeliveryTimeWithTransit(input, transitInputs);
  const updatedTransit: TransitPackage[] = [
    ...transitResult.stillInTransit,
    ...transitResult.newTransitPackages,
  ];
  const renamedPackages = transitResult.renamedPackages.length > 0
    ? transitResult.renamedPackages
    : undefined;
  const results = transitResult.results.map(mapTimeResult);
  return { success: true, mode: 'time', results, updatedTransit, renamedPackages };
}

export function runLocalTime(input: string): CalculationResult {
  const { baseCost, packages, vehicles } = parseInput(input, 'time');
  if (!vehicles) {
    return { success: false, error: 'Missing fleet line: expected "noOfVehicles maxSpeed maxCarrierWeight"' };
  }
  const deliveryResults = computeDeliveryResultsFromParsed(baseCost, packages, vehicles);
  const results = deliveryResults.map(mapTimeResult);
  const updatedTransit: TransitPackage[] = deliveryResults
    .filter((r: DetailedDeliveryResult) => r.undeliverable)
    .map((r: DetailedDeliveryResult) => ({
      id: r.id,
      weight: r.weight,
      distance: r.distance,
      offerCode: r.offerCode || '',
    }));
  return { success: true, mode: 'time', results, updatedTransit };
}

export function runLocally(
  input: string,
  mode: 'cost' | 'time',
  transitPackages: TransitPackage[],
): CalculationResult {
  if (mode === 'cost') {
    return runLocalCost(input);
  }
  if (transitPackages.length > 0) {
    return runLocalTimeWithTransit(input, transitPackages);
  }
  return runLocalTime(input);
}
