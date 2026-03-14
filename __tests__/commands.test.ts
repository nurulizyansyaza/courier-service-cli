import { runCost, runDelivery } from '../src/commands';

let output: string[];
beforeEach(() => {
  output = [];
  jest.spyOn(console, 'log').mockImplementation((...args) => output.push(args.join(' ')));
});
afterEach(() => jest.restoreAllMocks());

describe('runCost (Problem 1)', () => {
  it('prints id, discount, cost for each package', () => {
    runCost([
      '100 3',
      'PKG1 5 5 OFR001',
      'PKG2 15 5 OFR002',
      'PKG3 10 100 OFR003',
    ]);
    expect(output).toEqual([
      'PKG1 0 175',
      'PKG2 0 275',
      'PKG3 35 665',
    ]);
  });

  it('throws on empty input', () => {
    expect(() => runCost([])).toThrow('Empty input');
  });

  it('throws on invalid package ID format', () => {
    expect(() => runCost(['50 1', 'ITEM1 10 20 OFR001'])).toThrow('Must be "PKG" or "pkg"');
  });
});

describe('runDelivery (Problem 2)', () => {
  it('prints id, discount, cost, time for each package', () => {
    runDelivery([
      '100 5',
      'PKG1 50 30 OFR001',
      'PKG2 75 125 OFR008',
      'PKG3 175 100 OFR003',
      'PKG4 110 60 OFR002',
      'PKG5 155 95 NA',
      '2 70 200',
    ]);
    expect(output).toEqual([
      'PKG1 0 750 3.98',
      'PKG2 0 1475 1.78',
      'PKG3 0 2350 1.42',
      'PKG4 105 1395 0.85',
      'PKG5 0 2125 4.19',
    ]);
  });

  it('throws when fleet line is missing', () => {
    expect(() => runDelivery(['100 1', 'PKG1 10 10 OFR001'])).toThrow('vehicle info');
  });
});

describe('runDelivery --detailed', () => {
  it('prints detailed output with vehicle and round info', () => {
    runDelivery([
      '100 1',
      'PKG1 50 30 OFR001',
      '1 70 200',
    ], true);
    expect(output.length).toBe(2);
    expect(output[0]).toContain('PKG1');
    expect(output[1]).toContain('vehicle=');
    expect(output[1]).toContain('round=');
  });

  it('shows undeliverable reason for overweight packages', () => {
    runDelivery([
      '100 1',
      'PKG1 300 100 OFR001',
      '1 70 200',
    ], true);
    expect(output[0]).toContain('N/A');
    expect(output[1]).toContain('out for delivery');
  });
});
