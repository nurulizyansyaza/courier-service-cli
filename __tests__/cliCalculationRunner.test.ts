import { runCalculation } from '../src/cliCalculationRunner';

describe('runCalculation (local mode)', () => {
  test('calculates cost correctly', async () => {
    const input = '100 3\nPKG1 5 5 OFR001\nPKG2 15 5 OFR002\nPKG3 10 100 OFR003';
    const result = await runCalculation(input, 'cost', null, []);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.mode).toBe('cost');
    expect(result.results).toHaveLength(3);

    const pkg1 = result.results[0];
    expect(pkg1.id).toBe('PKG1');
    expect(pkg1.discount).toBe(0);
    expect(pkg1.totalCost).toBe(175);
  });

  test('calculates cost with applicable discount', async () => {
    const input = '100 1\nPKG1 70 100 OFR001';
    const result = await runCalculation(input, 'cost', null, []);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.results[0].discount).toBeGreaterThan(0);
  });

  test('calculates delivery time', async () => {
    const input = '100 3\nPKG1 50 30 OFR001\nPKG2 75 125 OFR002\nPKG3 175 100 OFR003\n2 70 200';
    const result = await runCalculation(input, 'time', null, []);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.mode).toBe('time');
    expect(result.results).toHaveLength(3);
  });

  test('returns error for invalid input', async () => {
    const result = await runCalculation('invalid', 'cost', null, []);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toBeTruthy();
  });

  test('returns error for missing fleet line in time mode', async () => {
    const input = '100 1\nPKG1 50 30 OFR001';
    const result = await runCalculation(input, 'time', null, []);
    expect(result.success).toBe(false);
  });

  test('falls back to local when API URL is null', async () => {
    const input = '100 1\nPKG1 5 5 OFR001';
    const result = await runCalculation(input, 'cost', null, []);
    expect(result.success).toBe(true);
  });

  test('falls back to local when API is unreachable', async () => {
    const input = '100 1\nPKG1 5 5 OFR001';
    const result = await runCalculation(input, 'cost', 'http://localhost:99999', []);
    expect(result.success).toBe(true);
  });
});
