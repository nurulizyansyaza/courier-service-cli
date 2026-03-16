import { runCalculation } from '../src/cliCalculationRunner';

describe('Courier CLI Calculation', () => {
  describe('Cost Mode', () => {
    describe('when calculating delivery costs for packages', () => {
      it('should compute cost with valid offer code discount', async () => {
        // OFR001: distance < 200, weight 70-200 → 10% discount
        const input = '100 1\nPKG1 100 150 OFR001';
        const result = await runCalculation(input, 'cost', null, []);

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.mode).toBe('cost');
        expect(result.results).toHaveLength(1);

        const pkg = result.results[0];
        expect(pkg.id).toBe('PKG1');
        expect(pkg.baseCost).toBe(100);
        expect(pkg.weight).toBe(100);
        expect(pkg.distance).toBe(150);
        // deliveryCost = 100 + (100*10) + (150*5) = 1850
        expect(pkg.deliveryCost).toBe(1850);
        expect(pkg.discount).toBeGreaterThan(0);
        expect(pkg.totalCost).toBeLessThan(1850);
      });

      it('should return zero discount when offer criteria not met', async () => {
        // OFR001: distance < 200, weight 70-200 → weight 10 not in range
        const input = '100 1\nPKG1 10 70 OFR001';
        const result = await runCalculation(input, 'cost', null, []);

        expect(result.success).toBe(true);
        if (!result.success) return;
        const pkg = result.results[0];
        expect(pkg.discount).toBe(0);
        expect(pkg.totalCost).toBe(pkg.deliveryCost);
      });

      it('should handle multiple packages in one calculation', async () => {
        const input = '100 3\nPKG1 100 150 OFR001\nPKG2 75 70 OFR003\nPKG3 100 200 OFR002';
        const result = await runCalculation(input, 'cost', null, []);

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.results).toHaveLength(3);
        expect(result.results.map(r => r.id)).toEqual(['PKG1', 'PKG2', 'PKG3']);
      });
    });

    describe('when input is invalid', () => {
      it('should return error for missing package count', async () => {
        const input = '100';
        const result = await runCalculation(input, 'cost', null, []);
        expect(result.success).toBe(false);
      });

      it('should return error for mismatched package count', async () => {
        const input = '100 3\nPKG1 50 70 N/A';
        const result = await runCalculation(input, 'cost', null, []);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Time Mode', () => {
    describe('when calculating delivery time for packages', () => {
      it('should assign delivery rounds and times', async () => {
        const input = '100 3\nPKG1 50 70 OFR001\nPKG2 75 70 OFR003\nPKG3 100 200 OFR002\n2 70 200';
        const result = await runCalculation(input, 'time', null, []);

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.mode).toBe('time');
        expect(result.results).toHaveLength(3);

        // Every delivered package should have a delivery time
        const delivered = result.results.filter(r => !r.undeliverable);
        for (const pkg of delivered) {
          expect(pkg.deliveryTime).toBeDefined();
          expect(typeof pkg.deliveryTime).toBe('number');
          expect(pkg.deliveryRound).toBeGreaterThanOrEqual(1);
        }
      });

      it('should output results in delivery round order', async () => {
        const input = '100 3\nPKG1 50 70 OFR001\nPKG2 75 70 OFR003\nPKG3 100 200 OFR002\n2 70 200';
        const result = await runCalculation(input, 'time', null, []);

        expect(result.success).toBe(true);
        if (!result.success) return;

        const rounds = result.results
          .filter(r => r.deliveryRound !== undefined)
          .map(r => r.deliveryRound!);

        // Rounds should be in non-decreasing order
        for (let i = 1; i < rounds.length; i++) {
          expect(rounds[i]).toBeGreaterThanOrEqual(rounds[i - 1]);
        }
      });

      it('should mark packages as undeliverable when too heavy for any vehicle', async () => {
        const input = '100 2\nPKG1 50 70 OFR001\nPKG2 300 150 NA\n1 70 80';
        const result = await runCalculation(input, 'time', null, []);

        expect(result.success).toBe(true);
        if (!result.success) return;

        const undeliverable = result.results.filter(r => r.undeliverable);
        expect(undeliverable.length).toBeGreaterThan(0);
        for (const pkg of undeliverable) {
          expect(pkg.undeliverableReason).toBeDefined();
        }
      });

      it('should track transit packages for undeliverable items', async () => {
        const input = '100 1\nPKG1 300 150 NA\n1 70 200';
        const result = await runCalculation(input, 'time', null, []);

        expect(result.success).toBe(true);
        if (!result.success) return;

        const undeliverable = result.results.filter(r => r.undeliverable);
        expect(undeliverable.length).toBeGreaterThan(0);
        expect(result.updatedTransit).toBeDefined();
        expect(result.updatedTransit!.length).toBeGreaterThan(0);
      });
    });

    describe('when input is invalid for time mode', () => {
      it('should return error for missing fleet line', async () => {
        // Time mode needs the vehicle line — without it, parsing should fail
        const input = '100 1\nPKG1 50 70 OFR001\n';
        const result = await runCalculation(input, 'time', null, []);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('API Fallback', () => {
    it('should fall back to local calculation when API is unavailable', async () => {
      const input = '100 1\nPKG1 100 150 OFR001';
      // Use a non-existent API URL — should fall back to local
      const result = await runCalculation(input, 'cost', 'http://127.0.0.1:19999', []);

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.results).toHaveLength(1);
    });

    it('should fall back to local when API URL is null', async () => {
      const input = '100 1\nPKG1 100 150 OFR001';
      const result = await runCalculation(input, 'cost', null, []);

      expect(result.success).toBe(true);
    });
  });
});
