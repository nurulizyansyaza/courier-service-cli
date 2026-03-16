import { mapToPackageResult, mapCostResult, mapTimeResult } from '../src/resultMapper';

describe('resultMapper', () => {
  describe('mapCostResult', () => {
    it('maps a cost package to PackageResult', () => {
      const pkg = { id: 'PKG1', weight: 50, distance: 70, offerCode: 'OFR001' };
      const result = mapCostResult(pkg, 100, 0, 950);

      expect(result).toEqual({
        id: 'PKG1',
        discount: 0,
        totalCost: 950,
        baseCost: 100,
        weight: 50,
        distance: 70,
        offerCode: 'OFR001',
        deliveryCost: 100 + 50 * 10 + 70 * 5,
      });
    });

    it('rounds discount and totalCost', () => {
      const pkg = { id: 'PKG1', weight: 70, distance: 100, offerCode: 'OFR001' };
      const result = mapCostResult(pkg, 100, 130.5, 1169.5);

      expect(result.discount).toBe(131);
      expect(result.totalCost).toBe(1170);
    });
  });

  describe('mapTimeResult', () => {
    it('maps a detailed delivery result to PackageResult', () => {
      const detailed = {
        id: 'PKG1',
        discount: 105.5,
        totalCost: 1394.5,
        baseCost: 100,
        weight: 110,
        distance: 60,
        offerCode: 'OFR002',
        deliveryCost: 1500,
        deliveryTime: 0.85,
        vehicleId: 1,
        deliveryRound: 1,
        packagesRemaining: 3,
        currentTime: 0,
        vehicleReturnTime: 3.57,
        roundTripTime: 3.57,
      };

      const result = mapTimeResult(detailed);

      expect(result.id).toBe('PKG1');
      expect(result.discount).toBe(106);
      expect(result.totalCost).toBe(1395);
      expect(result.deliveryTime).toBe(0.85);
      expect(result.vehicleId).toBe(1);
      expect(result.deliveryRound).toBe(1);
    });

    it('preserves undeliverable fields', () => {
      const detailed = {
        id: 'PKG3',
        discount: 0,
        totalCost: 2350,
        baseCost: 100,
        weight: 300,
        distance: 100,
        offerCode: 'NA',
        deliveryCost: 3600,
        undeliverable: true,
        undeliverableReason: 'PKG3 will be out for delivery if there is a vehicle that can carry 300kg and above',
      };

      const result = mapTimeResult(detailed);

      expect(result.undeliverable).toBe(true);
      expect(result.undeliverableReason).toContain('300kg');
      expect(result.deliveryTime).toBeUndefined();
    });
  });

  describe('mapToPackageResult', () => {
    it('maps API cost result with enrichment details', () => {
      const apiResult = { id: 'PKG1', discount: 0, cost: 175 };
      const details = new Map([['PKG1', { baseCost: 100, weight: 5, distance: 5, offerCode: 'OFR001', deliveryCost: 175 }]]);

      const result = mapToPackageResult(apiResult, details);

      expect(result.id).toBe('PKG1');
      expect(result.totalCost).toBe(175);
      expect(result.baseCost).toBe(100);
      expect(result.weight).toBe(5);
    });

    it('uses defaults when details not found', () => {
      const apiResult = { id: 'PKG1', discount: 0, cost: 175 };
      const details = new Map();

      const result = mapToPackageResult(apiResult, details);

      expect(result.baseCost).toBe(0);
      expect(result.weight).toBe(0);
      expect(result.distance).toBe(0);
      expect(result.deliveryCost).toBe(0);
    });
  });
});
