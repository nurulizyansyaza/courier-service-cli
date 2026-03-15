import {
  parseInput,
  calculatePackageCost,
  computeDeliveryResultsFromParsed,
} from '@nurulizyansyaza/courier-service-core';

export function runCost(lines: string[]): void {
  if (lines.length === 0) throw new Error('Empty input');
  const input = lines.join('\n');
  const { baseCost, packages } = parseInput(input, 'cost');

  for (const pkg of packages) {
    const { discount, totalCost } = calculatePackageCost(pkg, baseCost);
    console.log(`${pkg.id} ${Math.round(discount)} ${Math.round(totalCost)}`);
  }
}

export function runDelivery(lines: string[], detailed = false): void {
  if (lines.length === 0) throw new Error('Empty input');
  const input = lines.join('\n');
  const { baseCost, packages, vehicles } = parseInput(input, 'time');

  if (!vehicles) {
    throw new Error('Missing fleet line: expected "noOfVehicles maxSpeed maxCarrierWeight" after package lines');
  }

  const results = computeDeliveryResultsFromParsed(baseCost, packages, vehicles);

  for (const r of results) {
    if (r.undeliverable) {
      console.log(`${r.id} ${Math.round(r.discount)} ${Math.round(r.totalCost)} N/A`);
      if (detailed) {
        console.log(`  └─ ${r.undeliverableReason}`);
      }
    } else {
      console.log(`${r.id} ${Math.round(r.discount)} ${Math.round(r.totalCost)} ${r.deliveryTime!.toFixed(2)}`);
      if (detailed) {
        console.log(`  └─ vehicle=${r.vehicleId} round=${r.deliveryRound} return=${r.vehicleReturnTime!.toFixed(2)}`);
      }
    }
  }
}
