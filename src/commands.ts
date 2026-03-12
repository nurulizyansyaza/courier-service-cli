import {
  parsePackages, parseFleet,
  estimateCost, estimateDelivery,
  DEFAULT_OFFERS,
} from '@nurulizyansyaza/courier-service-core';

function parseHeader(line: string): [number, number] {
  const [b, c] = line.trim().split(/\s+/).map(Number);
  if (isNaN(b) || isNaN(c) || c <= 0) throw new Error('Invalid header: expected "baseCost count"');
  return [b, c];
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
  const fleet = parseFleet(lines[1 + count]);

  estimateDelivery(baseCost, packages, DEFAULT_OFFERS, fleet).forEach(r =>
    console.log(`${r.id} ${r.discount} ${r.cost} ${r.time}`)
  );
}
