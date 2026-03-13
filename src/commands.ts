import {
  parsePackages, parseFleet,
  estimateCost, estimateDelivery,
  DEFAULT_OFFERS,
} from '@nurulizyansyaza/courier-service-core';

function parseHeader(line: string): [number, number] {
  const parts = line.trim().split(/\s+/);
  if (parts.length !== 2) {
    throw new Error('Invalid header: expected "baseCost count"');
  }

  const baseCost = Number(parts[0]);
  const count = Number(parts[1]);

  if (!Number.isFinite(baseCost) || !Number.isFinite(count) || !Number.isInteger(count) || count <= 0) {
    throw new Error('Invalid header: expected "baseCost count"');
  }

  return [baseCost, count];
}

export function runCost(lines: string[]): void {
  if (lines.length === 0) throw new Error('Empty input: expected header line "baseCost count"');
  const [baseCost, count] = parseHeader(lines[0]);
  const packages = parsePackages(baseCost, count, lines.slice(1, 1 + count));

  estimateCost(baseCost, packages, DEFAULT_OFFERS).forEach(r =>
    console.log(`${r.id} ${r.discount} ${r.cost}`)
  );
}

export function runDelivery(lines: string[]): void {
  if (lines.length === 0) throw new Error('Empty input: expected header line "baseCost count"');
  const [baseCost, count] = parseHeader(lines[0]);
  const packages = parsePackages(baseCost, count, lines.slice(1, 1 + count));
  const fleetLine = lines[1 + count];
  if (typeof fleetLine !== 'string') {
    throw new Error('Missing fleet line: expected "noOfVehicles maxSpeed maxCarrierWeight" after package lines');
  }
  const fleet = parseFleet(fleetLine);

  estimateDelivery(baseCost, packages, DEFAULT_OFFERS, fleet).forEach(r =>
    console.log(`${r.id} ${r.discount} ${r.cost} ${r.time}`)
  );
}
