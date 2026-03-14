import {
  parseInputBlock,
  estimateCost, estimateDelivery,
  estimateDetailedDelivery,
  CalcOfferCriteria,
  DEFAULT_CALC_OFFERS,
  toOfferArray,
} from '@nurulizyansyaza/courier-service-core';

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
