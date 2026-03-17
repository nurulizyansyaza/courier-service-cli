import { runLocalCost, runLocalTime, runLocalTimeWithTransit, runLocally } from '../src/localCalculation';

describe('localCalculation', () => {
  describe('runLocalCost', () => {
    it('should calculate cost for a single package', () => {
      const result = runLocalCost('100 1\nPKG1 5 5 OFR001');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.mode).toBe('cost');
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe('PKG1');
      expect(result.results[0].deliveryCost).toBe(175);
    });

    it('should apply discount when offer criteria are met', () => {
      const result = runLocalCost('100 1\nPKG1 70 150 OFR001');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.results[0].discount).toBeGreaterThan(0);
    });

    it('should handle multiple packages', () => {
      const result = runLocalCost('100 3\nPKG1 5 5 OFR001\nPKG2 15 5 OFR002\nPKG3 10 100 OFR003');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.results).toHaveLength(3);
    });
  });

  describe('runLocalTime', () => {
    it('should calculate delivery time with vehicle assignment', () => {
      const result = runLocalTime('100 1\nPKG1 50 30 OFR001\n1 70 200');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.mode).toBe('time');
      expect(result.results[0].deliveryTime).toBeDefined();
      expect(result.results[0].vehicleId).toBeDefined();
    });

    it('should return error when vehicle line is missing', () => {
      // parseInput throws for time mode without vehicle line
      expect(() => runLocalTime('100 1\nPKG1 50 30 OFR001')).toThrow();
    });

    it('should track undeliverable packages as transit', () => {
      const result = runLocalTime('100 1\nPKG1 250 30 OFR001\n1 70 100');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.updatedTransit).toBeDefined();
      expect(result.updatedTransit!.length).toBeGreaterThan(0);
    });
  });

  describe('runLocalTimeWithTransit', () => {
    it('should merge transit packages with new input', () => {
      const transit = [{ id: 'PKG2', weight: 30, distance: 80, offerCode: 'NA' }];
      const result = runLocalTimeWithTransit('100 1\nPKG1 50 30 OFR001\n2 70 200', transit);
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.results.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle renamed packages', () => {
      const transit = [{ id: 'PKG1', weight: 30, distance: 80, offerCode: 'NA' }];
      const result = runLocalTimeWithTransit('100 1\nPKG1 50 30 OFR001\n2 70 200', transit);
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.renamedPackages).toBeDefined();
      expect(result.renamedPackages!.length).toBe(1);
    });
  });

  describe('runLocally', () => {
    it('should dispatch to cost mode', () => {
      const result = runLocally('100 1\nPKG1 5 5 OFR001', 'cost', []);
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.mode).toBe('cost');
    });

    it('should dispatch to time mode without transit', () => {
      const result = runLocally('100 1\nPKG1 50 30 OFR001\n1 70 200', 'time', []);
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.mode).toBe('time');
    });

    it('should dispatch to time mode with transit', () => {
      const transit = [{ id: 'PKG2', weight: 30, distance: 80, offerCode: 'NA' }];
      const result = runLocally('100 1\nPKG1 50 30 OFR001\n2 70 200', 'time', transit);
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.results.length).toBeGreaterThanOrEqual(2);
    });
  });
});
