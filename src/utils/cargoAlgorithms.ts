
import { CargoItem, StorageContainer, Priority, Status, PlacementRecommendation, RearrangementPlan } from '@/types';

/**
 * Utility functions for cargo management algorithms
 */

// Placement recommendation algorithm
export const generatePlacementRecommendations = (
  items: CargoItem[],
  containers: StorageContainer[]
): PlacementRecommendation[] => {
  const inTransitItems = items.filter(item => item.status === 'in-transit');
  const availableContainers = containers.filter(container => 
    container.usedCapacity < container.capacity
  );
  
  return inTransitItems.map(item => {
    // Filter containers that have enough space for the item
    const suitableContainers = availableContainers.filter(
      container => container.capacity - container.usedCapacity >= item.volume
    );
    
    if (suitableContainers.length === 0) {
      return {
        itemId: item.id,
        itemName: item.name,
        recommendedContainer: 'Requires rearrangement',
        reason: 'No suitable container available with current arrangement'
      };
    }
    
    // Sort containers based on priority and space efficiency
    let bestContainer: StorageContainer;
    
    if (item.priority === 'high') {
      // For high priority items, place in containers with least items for quick access
      bestContainer = suitableContainers.sort((a, b) => a.items.length - b.items.length)[0];
      
      return {
        itemId: item.id,
        itemName: item.name,
        recommendedContainer: bestContainer.name,
        reason: 'High priority item placed in most accessible location'
      };
    } else if (item.priority === 'medium') {
      // For medium priority, balance between accessibility and space efficiency
      bestContainer = suitableContainers.sort((a, b) => {
        // Calculate a score based on both space utilization and accessibility
        const aSpaceScore = (a.capacity - a.usedCapacity) / a.capacity;
        const bSpaceScore = (b.capacity - b.usedCapacity) / b.capacity;
        const aAccessScore = 1 / (a.items.length + 1);
        const bAccessScore = 1 / (b.items.length + 1);
        
        // Combined score weighted 60% space, 40% accessibility
        const aScore = 0.6 * aSpaceScore + 0.4 * aAccessScore;
        const bScore = 0.6 * bSpaceScore + 0.4 * bAccessScore;
        
        return bScore - aScore; // Higher score first
      })[0];
      
      return {
        itemId: item.id,
        itemName: item.name,
        recommendedContainer: bestContainer.name,
        reason: 'Medium priority item placed with balanced space efficiency and accessibility'
      };
    } else {
      // For low priority items, maximize space efficiency
      bestContainer = suitableContainers.sort((a, b) => {
        // Sort containers by most utilized first (to consolidate low priority items)
        return (b.usedCapacity / b.capacity) - (a.usedCapacity / a.capacity); 
      })[0];
      
      return {
        itemId: item.id,
        itemName: item.name,
        recommendedContainer: bestContainer.name,
        reason: 'Low priority item placed to maximize space efficiency'
      };
    }
  });
};

// Rearrangement planning algorithm
export const generateRearrangementPlan = (
  items: CargoItem[],
  containers: StorageContainer[],
  incomingItems: CargoItem[]
): RearrangementPlan | null => {
  // Calculate total space needed for incoming items
  const spaceNeeded = incomingItems.reduce((total, item) => total + item.volume, 0);
  
  // Calculate total available space
  const availableSpace = containers.reduce(
    (total, container) => total + (container.capacity - container.usedCapacity), 
    0
  );
  
  // If there's enough space already, no rearrangement needed
  if (availableSpace >= spaceNeeded) {
    return null;
  }
  
  // Find low priority items that can be relocated to make space
  const lowPriorityItems = items
    .filter(item => item.priority === 'low' && item.status === 'stored')
    // Sort by least recently modified (least recently accessed)
    .sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime());
  
  // If no low priority items, try medium priority items
  let itemsToMove = lowPriorityItems;
  if (itemsToMove.length === 0) {
    const mediumPriorityItems = items
      .filter(item => item.priority === 'medium' && item.status === 'stored')
      .sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime());
    
    itemsToMove = mediumPriorityItems;
  }
  
  // If still no items to move, return null
  if (itemsToMove.length === 0) {
    return null;
  }
  
  // Calculate how much space we need to free up
  const spaceToFree = spaceNeeded - availableSpace;
  
  // Select items to move until we have freed enough space
  let spaceFreed = 0;
  const itemsToRelocate: CargoItem[] = [];
  
  for (const item of itemsToMove) {
    itemsToRelocate.push(item);
    spaceFreed += item.volume;
    if (spaceFreed >= spaceToFree) break;
  }
  
  // If we can't free enough space, return null
  if (spaceFreed < spaceToFree) {
    return null;
  }
  
  // Create the rearrangement plan
  return {
    steps: itemsToRelocate.map(item => ({
      itemId: item.id,
      itemName: item.name,
      fromLocation: item.location,
      toLocation: 'Temporary Storage',
      priority: item.priority
    })),
    reason: `${itemsToRelocate.length} ${itemsToRelocate[0].priority} priority items need to be relocated to make space for incoming items`
  };
};

// Item search optimization algorithm
export const optimizeItemRetrieval = (
  searchQuery: string,
  items: CargoItem[]
): CargoItem[] => {
  const normalizedQuery = searchQuery.toLowerCase().trim();
  
  if (!normalizedQuery) return [];
  
  return items
    .filter(item => {
      // Match by name, ID, location, or status
      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.id.toLowerCase().includes(normalizedQuery) ||
        item.location.toLowerCase().includes(normalizedQuery) ||
        item.status.toLowerCase().includes(normalizedQuery) ||
        item.priority.toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((a, b) => {
      // Sort by exact name match first
      if (a.name.toLowerCase() === normalizedQuery && b.name.toLowerCase() !== normalizedQuery)
        return -1;
      if (b.name.toLowerCase() === normalizedQuery && a.name.toLowerCase() !== normalizedQuery)
        return 1;
      
      // Then by priority (high > medium > low)
      const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority])
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      
      // Then by expiration date (if available)
      if (a.expirationDate && b.expirationDate)
        return a.expirationDate.getTime() - b.expirationDate.getTime();
      if (a.expirationDate) return -1;
      if (b.expirationDate) return 1;
      
      // Then by last modified (most recent first)
      return b.lastModified.getTime() - a.lastModified.getTime();
    });
};

// Identify items close to expiration
export const identifyExpiringItems = (
  items: CargoItem[],
  daysThreshold: number = 14
): CargoItem[] => {
  const today = new Date();
  const thresholdDate = new Date();
  thresholdDate.setDate(today.getDate() + daysThreshold);
  
  return items.filter(item => 
    item.status !== 'waste' && 
    item.expirationDate && 
    item.expirationDate > today && 
    item.expirationDate <= thresholdDate
  ).sort((a, b) => 
    (a.expirationDate as Date).getTime() - (b.expirationDate as Date).getTime()
  );
};

// Simulate time passage
export const simulateTimePassed = (
  items: CargoItem[],
  days: number
): CargoItem[] => {
  const simulatedDate = new Date();
  simulatedDate.setDate(simulatedDate.getDate() + days);
  
  return items.map(item => {
    // Check for expiration
    if (
      item.expirationDate && 
      item.expirationDate <= simulatedDate && 
      item.status !== 'waste'
    ) {
      return { ...item, status: 'waste', lastModified: simulatedDate };
    }
    
    // Simulate usage for items - just a basic simulation
    // In a real system, this would be based on usage patterns
    if (item.status === 'stored' && Math.random() < 0.1 * days) {
      return { 
        ...item, 
        usageCount: item.usageCount + Math.floor(Math.random() * days) + 1,
        lastModified: simulatedDate
      };
    }
    
    return item;
  });
};

// Generate waste management manifest
export const generateWasteManifest = (
  wasteItems: CargoItem[]
): { summary: any, items: CargoItem[] } => {
  const totalVolume = wasteItems.reduce((total, item) => total + item.volume, 0);
  const totalWeight = wasteItems.reduce((total, item) => total + item.weight, 0);
  
  // Group waste by type (in a real system, items would have a waste type property)
  const wasteTypes = {
    standard: wasteItems.filter(item => !item.name.toLowerCase().includes('hazard')),
    hazardous: wasteItems.filter(item => item.name.toLowerCase().includes('hazard')),
  };
  
  return {
    summary: {
      totalItems: wasteItems.length,
      totalVolume,
      totalWeight,
      standardItems: wasteTypes.standard.length,
      hazardousItems: wasteTypes.hazardous.length,
      returnVehicle: 'Progress MS-23',
      estimatedDateOfReturn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    items: wasteItems
  };
};
