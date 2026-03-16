import {
  parseInput,
  calculatePackageCost,
  computeDeliveryResultsFromParsed,
  calculateDeliveryTimeWithTransit,
  type DetailedDeliveryResult,
  type TransitPackageInput,
} from '@nurulizyansyaza/courier-service-core';

export interface PackageResult {
  id: string;
  discount: number;
  totalCost: number;
  baseCost: number;
  weight: number;
  distance: number;
  offerCode?: string;
  deliveryCost: number;
  deliveryTime?: number;
  vehicleId?: number;
  deliveryRound?: number;
  packagesRemaining?: number;
  currentTime?: number;
  vehicleReturnTime?: number;
  roundTripTime?: number;
  undeliverable?: boolean;
  undeliverableReason?: string;
  renamedFrom?: string;
}

export interface TransitPackage {
  id: string;
  weight: number;
  distance: number;
  offerCode: string;
}

export interface CalculationSuccess {
  success: true;
  mode: 'cost' | 'time';
  results: PackageResult[];
  updatedTransit?: TransitPackage[];
  renamedPackages?: { oldId: string; newId: string }[];
}

export interface CalculationFailure {
  success: false;
  error: string;
}

export type CalculationResult = CalculationSuccess | CalculationFailure;

interface ApiCostResult {
  id: string;
  discount: number;
  cost: number;
}

interface ApiTimeData {
  results: ApiTimeResult[];
  stillInTransit?: TransitPackage[];
  newTransitPackages?: TransitPackage[];
  renamedPackages?: { oldId: string; newId: string }[];
}

interface ApiTimeResult {
  id: string;
  discount: number;
  totalCost: number;
  deliveryTime?: number;
  vehicleId?: number;
  deliveryRound?: number;
  packagesRemaining?: number;
  currentTime?: number;
  vehicleReturnTime?: number;
  roundTripTime?: number;
  undeliverable?: boolean;
  undeliverableReason?: string;
  baseCost?: number;
  weight?: number;
  distance?: number;
  offerCode?: string;
  deliveryCost?: number;
}

// Parse input to extract package details for enriching API/transit results
function extractPackageDetails(input: string, mode: 'cost' | 'time') {
  try {
    const { baseCost, packages } = parseInput(input, mode);
    const detailMap = new Map<string, { baseCost: number; weight: number; distance: number; offerCode?: string; deliveryCost: number }>();
    for (const pkg of packages) {
      const deliveryCost = baseCost + pkg.weight * 10 + pkg.distance * 5;
      detailMap.set(pkg.id.toUpperCase(), {
        baseCost,
        weight: pkg.weight,
        distance: pkg.distance,
        offerCode: pkg.offerCode,
        deliveryCost,
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
      const results: PackageResult[] = data.results.map((r) => {
        const d = details.get(r.id.toUpperCase());
        return {
          id: r.id,
          discount: r.discount,
          totalCost: r.cost,
          baseCost: d?.baseCost ?? 0,
          weight: d?.weight ?? 0,
          distance: d?.distance ?? 0,
          offerCode: d?.offerCode,
          deliveryCost: d?.deliveryCost ?? 0,
        };
      });
      return { success: true, mode: 'cost', results };
    } else {
      const data = await res.json() as ApiTimeData;
      const results: PackageResult[] = data.results.map((r) => {
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
      const renamedPackages = data.renamedPackages && data.renamedPackages.length > 0
        ? data.renamedPackages.map((r: { oldId: string; newId: string }) => ({
            oldId: r.oldId,
            newId: r.newId,
          }))
        : undefined;
      return { success: true, mode: 'time', results, updatedTransit, renamedPackages };
    }
  } catch {
    return null;
  }
}

function runLocally(
  input: string,
  mode: 'cost' | 'time',
  transitPackages: TransitPackage[],
): CalculationResult {
  if (mode === 'cost') {
    const { baseCost, packages } = parseInput(input, 'cost');
    const results: PackageResult[] = packages.map((pkg) => {
      const { discount, totalCost } = calculatePackageCost(pkg, baseCost);
      const deliveryCost = baseCost + pkg.weight * 10 + pkg.distance * 5;
      return {
        id: pkg.id,
        discount: Math.round(discount),
        totalCost: Math.round(totalCost),
        baseCost,
        weight: pkg.weight,
        distance: pkg.distance,
        offerCode: pkg.offerCode,
        deliveryCost,
      };
    });
    return { success: true, mode: 'cost', results };
  } else {
    if (transitPackages.length > 0) {
      const transitInputs: TransitPackageInput[] = transitPackages.map((t) => ({
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

      const results: PackageResult[] = transitResult.results.map((r) => ({
        id: r.id,
        discount: Math.round(r.discount),
        totalCost: Math.round(r.totalCost),
        baseCost: r.baseCost,
        weight: r.weight,
        distance: r.distance,
        offerCode: r.offerCode,
        deliveryCost: r.deliveryCost,
        deliveryTime: r.deliveryTime,
        vehicleId: r.vehicleId,
        deliveryRound: r.deliveryRound,
        packagesRemaining: r.packagesRemaining,
        currentTime: r.currentTime,
        vehicleReturnTime: r.vehicleReturnTime,
        roundTripTime: r.roundTripTime,
        undeliverable: r.undeliverable,
        undeliverableReason: r.undeliverableReason,
      }));
      return { success: true, mode: 'time', results, updatedTransit, renamedPackages };
    }

    const { baseCost, packages, vehicles } = parseInput(input, 'time');
    if (!vehicles) {
      return { success: false, error: 'Missing fleet line: expected "noOfVehicles maxSpeed maxCarrierWeight"' };
    }
    const deliveryResults = computeDeliveryResultsFromParsed(baseCost, packages, vehicles);
    const results: PackageResult[] = deliveryResults.map((r: DetailedDeliveryResult) => ({
      id: r.id,
      discount: Math.round(r.discount),
      totalCost: Math.round(r.totalCost),
      baseCost: r.baseCost,
      weight: r.weight,
      distance: r.distance,
      offerCode: r.offerCode,
      deliveryCost: r.deliveryCost,
      deliveryTime: r.deliveryTime,
      vehicleId: r.vehicleId,
      deliveryRound: r.deliveryRound,
      packagesRemaining: r.packagesRemaining,
      currentTime: r.currentTime,
      vehicleReturnTime: r.vehicleReturnTime,
      roundTripTime: r.roundTripTime,
      undeliverable: r.undeliverable,
      undeliverableReason: r.undeliverableReason,
    }));
    return { success: true, mode: 'time', results };
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
