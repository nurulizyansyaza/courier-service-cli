export interface PackageResult {
  id: string;
  discount: number;
  totalCost: number;
  baseCost: number;
  weight: number;
  distance: number;
  offerCode?: string;
  deliveryCost: number;
  deliveryTime?: number;
  vehicleId?: number;
  deliveryRound?: number;
  packagesRemaining?: number;
  currentTime?: number;
  vehicleReturnTime?: number;
  roundTripTime?: number;
  undeliverable?: boolean;
  undeliverableReason?: string;
  renamedFrom?: string;
}

export interface TransitPackage {
  id: string;
  weight: number;
  distance: number;
  offerCode: string;
}

export interface CalculationSuccess {
  success: true;
  mode: 'cost' | 'time';
  results: PackageResult[];
  updatedTransit?: TransitPackage[];
  renamedPackages?: { oldId: string; newId: string }[];
}

export interface CalculationFailure {
  success: false;
  error: string;
}

export type CalculationResult = CalculationSuccess | CalculationFailure;

export interface ApiCostResult {
  id: string;
  discount: number;
  cost: number;
}

export interface ApiTimeResult {
  id: string;
  discount: number;
  totalCost: number;
  deliveryTime?: number;
  vehicleId?: number;
  deliveryRound?: number;
  packagesRemaining?: number;
  currentTime?: number;
  vehicleReturnTime?: number;
  roundTripTime?: number;
  undeliverable?: boolean;
  undeliverableReason?: string;
  baseCost?: number;
  weight?: number;
  distance?: number;
  offerCode?: string;
  deliveryCost?: number;
}

export interface ApiTimeData {
  results: ApiTimeResult[];
  stillInTransit?: TransitPackage[];
  newTransitPackages?: TransitPackage[];
  renamedPackages?: { oldId: string; newId: string }[];
}
