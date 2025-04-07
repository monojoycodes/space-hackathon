
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'stored' | 'in-transit' | 'waste';

export interface CargoItem {
  id: string;
  name: string;
  priority: Priority;
  status: Status;
  location: string;
  weight: number;
  volume: number;
  lastModified: Date;
  expirationDate?: Date;
  usageCount: number;
}

export interface StorageContainer {
  id: string;
  name: string;
  capacity: number;
  usedCapacity: number;
  location: string;
  items: CargoItem[];
}

export interface ActionLog {
  id: string;
  timestamp: Date;
  action: 'place' | 'retrieve' | 'relocate' | 'dispose';
  itemId: string;
  itemName: string;
  location?: string;
  user: string;
  details?: string;
}

export interface PlacementRecommendation {
  itemId: string;
  itemName: string;
  recommendedContainer: string;
  reason: string;
}

export interface RearrangementPlan {
  steps: {
    itemId: string;
    itemName: string;
    fromLocation: string;
    toLocation: string;
    priority: Priority;
  }[];
  reason: string;
}
