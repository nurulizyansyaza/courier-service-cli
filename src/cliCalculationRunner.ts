import {
  parseInput,
} from '@nurulizyansyaza/courier-service-core';
import type {
  PackageResult,
  TransitPackage,
  CalculationResult,
  ApiCostResult,
  ApiTimeData,
} from './types';
import { mapToPackageResult, type PackageDetail } from './resultMapper';
import { runLocally } from './localCalculation';

// Re-export types for consumers
export type { PackageResult, TransitPackage, CalculationResult } from './types';
export type { CalculationSuccess, CalculationFailure } from './types';

function extractPackageDetails(input: string, mode: 'cost' | 'time'): Map<string, PackageDetail> {
  try {
    const { baseCost, packages } = parseInput(input, mode);
    const detailMap = new Map<string, PackageDetail>();
    for (const pkg of packages) {
      detailMap.set(pkg.id.toUpperCase(), {
        baseCost,
        weight: pkg.weight,
        distance: pkg.distance,
        offerCode: pkg.offerCode,
        deliveryCost: baseCost + pkg.weight * 10 + pkg.distance * 5,
      });
    }
    return detailMap;
  } catch {
    return new Map();
  }
}

async function fetchFromApi(
  input: string,
  mode: 'cost' | 'time',
  apiUrl: string,
  transitPackages: TransitPackage[],
): Promise<CalculationResult | null> {
  try {
    const endpoint = mode === 'cost' ? '/api/cost' : '/api/delivery/transit';
    const body: Record<string, unknown> = { input };
    if (mode === 'time') body.transitPackages = transitPackages;

    const res = await fetch(`${apiUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      try {
        const errorData = await res.json() as { error?: string };
        if (errorData.error) return { success: false, error: errorData.error };
      } catch { /* not JSON */ }
      return null;
    }

    const details = extractPackageDetails(input, mode);

    if (mode === 'cost') {
      const data = await res.json() as { results: ApiCostResult[] };
      const results = data.results.map(r => mapToPackageResult(r, details));
      return { success: true, mode: 'cost', results };
    } else {
      const data = await res.json() as ApiTimeData;
      const results: PackageResult[] = data.results.map(r => {
        const d = details.get(r.id.toUpperCase());
        return {
          id: r.id,
          discount: r.discount,
          totalCost: r.totalCost,
          baseCost: r.baseCost ?? d?.baseCost ?? 0,
          weight: r.weight ?? d?.weight ?? 0,
          distance: r.distance ?? d?.distance ?? 0,
          offerCode: r.offerCode ?? d?.offerCode,
          deliveryCost: r.deliveryCost ?? d?.deliveryCost ?? 0,
          deliveryTime: r.deliveryTime,
          vehicleId: r.vehicleId,
          deliveryRound: r.deliveryRound,
          packagesRemaining: r.packagesRemaining,
          currentTime: r.currentTime,
          vehicleReturnTime: r.vehicleReturnTime,
          roundTripTime: r.roundTripTime,
          undeliverable: r.undeliverable,
          undeliverableReason: r.undeliverableReason,
        };
      });
      const updatedTransit: TransitPackage[] = [
        ...(data.stillInTransit || []),
        ...(data.newTransitPackages || []),
      ];
      const renamedPackages = data.renamedPackages?.length
        ? data.renamedPackages
        : undefined;
      return { success: true, mode: 'time', results, updatedTransit, renamedPackages };
    }
  } catch {
    return null;
  }
}

export async function runCalculation(
  input: string,
  mode: 'cost' | 'time',
  apiUrl: string | null,
  transitPackages: TransitPackage[],
): Promise<CalculationResult> {
  if (apiUrl) {
    const apiResult = await fetchFromApi(input, mode, apiUrl, transitPackages);
    if (apiResult) return apiResult;
  }

  try {
    return runLocally(input, mode, transitPackages);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Invalid input' };
  }
}
