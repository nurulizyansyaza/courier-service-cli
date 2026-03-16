import type { PackageResult, ApiCostResult } from './types';
import type { DetailedDeliveryResult } from '@nurulizyansyaza/courier-service-core';

export interface PackageDetail {
  baseCost: number;
  weight: number;
  distance: number;
  offerCode?: string;
  deliveryCost: number;
}

/** Map a cost-mode package to PackageResult */
export function mapCostResult(
  pkg: { id: string; weight: number; distance: number; offerCode?: string },
  baseCost: number,
  discount: number,
  totalCost: number,
): PackageResult {
  return {
    id: pkg.id,
    discount: Math.round(discount),
    totalCost: Math.round(totalCost),
    baseCost,
    weight: pkg.weight,
    distance: pkg.distance,
    offerCode: pkg.offerCode,
    deliveryCost: baseCost + pkg.weight * 10 + pkg.distance * 5,
  };
}

/** Map a DetailedDeliveryResult to PackageResult */
export function mapTimeResult(r: DetailedDeliveryResult): PackageResult {
  return {
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
  };
}

/** Map an API cost result with enrichment details */
export function mapToPackageResult(
  r: ApiCostResult,
  details: Map<string, PackageDetail>,
): PackageResult {
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
}
