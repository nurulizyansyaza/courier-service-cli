import {
  parseInputBlock,
  estimateCost, estimateDelivery,
  estimateDetailedDelivery,
  DEFAULT_OFFERS,
  Offer, CalcOfferCriteria,
} from '@nurulizyansyaza/courier-service-core';

const DEFAULT_CALC_OFFERS: Record<string, CalcOfferCriteria> = {
  OFR001: { discount: 10, minDistance: 0, maxDistance: 200, minWeight: 70, maxWeight: 200 },
  OFR002: { discount: 7, minDistance: 50, maxDistance: 150, minWeight: 100, maxWeight: 250 },
  OFR003: { discount: 5, minDistance: 50, maxDistance: 250, minWeight: 10, maxWeight: 150 },
};

function toOfferArray(offers: Record<string, CalcOfferCriteria>): Offer[] {
  return Object.entries(offers).map(([code, c]) => ({
    code,
    discount: c.discount,
    weight: { min: c.minWeight, max: c.maxWeight },
    distance: { min: c.minDistance, max: c.maxDistance },
  }));
}

export function runCost(lines: string[]): void {
  if (lines.length === 0) throw new Error('Empty input');
  const input = lines.join('\n');
  const { baseCost, packages } = parseInputBlock(input, 'cost', DEFAULT_CALC_OFFERS);

  estimateCost(baseCost, packages, toOfferArray(DEFAULT_CALC_OFFERS)).forEach(r =>
    console.log(`${r.id} ${r.discount} ${r.cost}`)
  );
}

export function runDelivery(lines: string[], detailed = false): void {
  if (lines.length === 0) throw new Error('Empty input');
  const input = lines.join('\n');
  const { baseCost, packages, vehicles } = parseInputBlock(input, 'time', DEFAULT_CALC_OFFERS);

  if (!vehicles) {
    throw new Error('Missing fleet line: expected "noOfVehicles maxSpeed maxCarrierWeight" after package lines');
  }

  if (detailed) {
    const results = estimateDetailedDelivery(baseCost, packages, DEFAULT_CALC_OFFERS, vehicles);
    for (const r of results) {
      if (r.undeliverable) {
        console.log(`${r.id} ${Math.round(r.discount)} ${Math.round(r.totalCost)} N/A`);
        console.log(`  └─ ${r.undeliverableReason}`);
      } else {
        console.log(`${r.id} ${Math.round(r.discount)} ${Math.round(r.totalCost)} ${r.deliveryTime!.toFixed(2)}`);
        console.log(`  └─ vehicle=${r.vehicleId} round=${r.deliveryRound} return=${r.vehicleReturnTime!.toFixed(2)}`);
      }
    }
  } else {
    const fleet = { count: vehicles.count, maxSpeed: vehicles.maxSpeed, maxWeight: vehicles.maxWeight };
    estimateDelivery(baseCost, packages, toOfferArray(DEFAULT_CALC_OFFERS), fleet).forEach(r =>
      console.log(`${r.id} ${r.discount} ${r.cost} ${r.time}`)
    );
  }
}
