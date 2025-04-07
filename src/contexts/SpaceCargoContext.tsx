import React, { createContext, useContext, useState, useEffect } from 'react';
import { CargoItem, StorageContainer, ActionLog, PlacementRecommendation, RearrangementPlan, Priority, Status } from '@/types';
import { toast } from '@/hooks/use-toast';
import { 
  generatePlacementRecommendations, 
  generateRearrangementPlan, 
  optimizeItemRetrieval,
  identifyExpiringItems,
  simulateTimePassed,
  generateWasteManifest
} from '@/utils/cargoAlgorithms';

interface SpaceCargoContextType {
  items: CargoItem[];
  containers: StorageContainer[];
  logs: ActionLog[];
  recommendations: PlacementRecommendation[];
  rearrangementPlan: RearrangementPlan | null;
  expiringItems: CargoItem[];
  wasteManifest: any;
  
  addItem: (item: Omit<CargoItem, 'id' | 'lastModified' | 'usageCount'>) => void;
  updateItem: (id: string, updates: Partial<CargoItem>) => void;
  retrieveItem: (id: string) => void;
  markAsWaste: (id: string) => void;
  
  addContainer: (container: Omit<StorageContainer, 'id' | 'usedCapacity' | 'items'>) => void;
  
  importItems: (csv: File) => Promise<void>;
  importContainers: (csv: File) => Promise<void>;
  exportCurrentArrangement: () => void;
  
  simulateDay: () => void;
  simulateDays: (days: number) => void;
  
  getItemsByStatus: (status: Status) => CargoItem[];
  getItemsByPriority: (priority: Priority) => CargoItem[];
  getWasteItems: () => CargoItem[];
  getActiveItems: () => CargoItem[];
  searchItems: (query: string) => CargoItem[];
  executeRearrangementPlan: () => void;
  prepareWasteForUndocking: () => void;
}

const SpaceCargoContext = createContext<SpaceCargoContextType | undefined>(undefined);

const sampleItems: CargoItem[] = [
  {
    id: '1',
    name: 'Cargo Item 1',
    priority: 'medium',
    status: 'stored',
    location: 'Bay 1',
    weight: 6,
    volume: 16,
    lastModified: new Date(),
    usageCount: 0
  },
  {
    id: '2',
    name: 'Cargo Item 2',
    priority: 'medium',
    status: 'stored',
    location: 'Bay 2',
    weight: 61,
    volume: 8,
    lastModified: new Date(),
    usageCount: 0
  },
  {
    id: '3',
    name: 'Cargo Item 3',
    priority: 'high',
    status: 'waste',
    location: 'Bay 3',
    weight: 99,
    volume: 27,
    lastModified: new Date(),
    usageCount: 5
  },
  {
    id: '4',
    name: 'Cargo Item 4',
    priority: 'medium',
    status: 'in-transit',
    location: 'Bay 4',
    weight: 77,
    volume: 17,
    lastModified: new Date(),
    usageCount: 0
  },
  {
    id: '5',
    name: 'Cargo Item 5',
    priority: 'low',
    status: 'stored',
    location: 'Bay 9',
    weight: 25,
    volume: 12,
    lastModified: new Date(),
    usageCount: 0
  },
  {
    id: '6',
    name: 'Cargo Item 6',
    priority: 'low',
    status: 'stored',
    location: 'Bay 8',
    weight: 32,
    volume: 18,
    lastModified: new Date(),
    usageCount: 0
  }
];

const sampleContainers: StorageContainer[] = [
  {
    id: '1',
    name: 'Bay 1',
    capacity: 100,
    usedCapacity: 16,
    location: 'Module A',
    items: [sampleItems[0]]
  },
  {
    id: '2',
    name: 'Bay 2',
    capacity: 100,
    usedCapacity: 8,
    location: 'Module A',
    items: [sampleItems[1]]
  },
  {
    id: '3',
    name: 'Bay 3',
    capacity: 100,
    usedCapacity: 27,
    location: 'Module B',
    items: [sampleItems[2]]
  },
  {
    id: '4',
    name: 'Bay 4',
    capacity: 100,
    usedCapacity: 17,
    location: 'Module B',
    items: [sampleItems[3]]
  },
  {
    id: '5',
    name: 'Bay 5',
    capacity: 100,
    usedCapacity: 0,
    location: 'Module C',
    items: []
  },
  {
    id: '6',
    name: 'Bay 6',
    capacity: 100,
    usedCapacity: 0,
    location: 'Module C',
    items: []
  },
  {
    id: '7',
    name: 'Bay 7',
    capacity: 100,
    usedCapacity: 0,
    location: 'Module D',
    items: []
  },
  {
    id: '8',
    name: 'Bay 8',
    capacity: 100,
    usedCapacity: 18,
    location: 'Module D',
    items: [sampleItems[5]]
  },
  {
    id: '9',
    name: 'Bay 9',
    capacity: 100,
    usedCapacity: 12,
    location: 'Module E',
    items: [sampleItems[4]]
  },
  {
    id: '10',
    name: 'Bay 10',
    capacity: 100,
    usedCapacity: 0,
    location: 'Module E',
    items: []
  },
  {
    id: '11',
    name: 'Bay 11',
    capacity: 100,
    usedCapacity: 0,
    location: 'Module F',
    items: []
  },
  {
    id: '12',
    name: 'Bay 12',
    capacity: 100,
    usedCapacity: 0,
    location: 'Module F',
    items: []
  }
];

const sampleLogs: ActionLog[] = [
  {
    id: '1',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 5)),
    action: 'place',
    itemId: '1',
    itemName: 'Cargo Item 1',
    location: 'Bay 1',
    user: 'Astronaut Smith'
  },
  {
    id: '2',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 3)),
    action: 'retrieve',
    itemId: '3',
    itemName: 'Cargo Item 3',
    location: 'Bay 3',
    user: 'Astronaut Johnson'
  },
  {
    id: '3',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
    action: 'dispose',
    itemId: '3',
    itemName: 'Cargo Item 3',
    user: 'Astronaut Wilson',
    details: 'Item marked as waste due to expiration'
  }
];

export const SpaceCargoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CargoItem[]>(sampleItems);
  const [containers, setContainers] = useState<StorageContainer[]>(sampleContainers);
  const [logs, setLogs] = useState<ActionLog[]>(sampleLogs);
  const [recommendations, setRecommendations] = useState<PlacementRecommendation[]>([]);
  const [rearrangementPlan, setRearrangementPlan] = useState<RearrangementPlan | null>(null);
  const [expiringItems, setExpiringItems] = useState<CargoItem[]>([]);
  const [wasteManifest, setWasteManifest] = useState<any>(null);

  const addItem = (item: Omit<CargoItem, 'id' | 'lastModified' | 'usageCount'>) => {
    const newItem: CargoItem = {
      ...item,
      id: `item-${Date.now()}`,
      lastModified: new Date(),
      usageCount: 0
    };
    
    setItems((prev) => [...prev, newItem]);
    
    setContainers((prev) => 
      prev.map((container) => 
        container.name === newItem.location
          ? {
              ...container,
              usedCapacity: container.usedCapacity + newItem.volume,
              items: [...container.items, newItem]
            }
          : container
      )
    );
    
    addLog({
      action: 'place',
      itemId: newItem.id,
      itemName: newItem.name,
      location: newItem.location,
      user: 'Current User',
      details: `Added ${newItem.name} to ${newItem.location}`
    });
    
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to ${newItem.location}`,
    });
  };

  const addLog = (log: Omit<ActionLog, 'id' | 'timestamp'>) => {
    const newLog: ActionLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date()
    };
    
    setLogs((prev) => [newLog, ...prev]);
  };

  const updateItem = (id: string, updates: Partial<CargoItem>) => {
    setItems((prev) => 
      prev.map((item) => 
        item.id === id
          ? { ...item, ...updates, lastModified: new Date() }
          : item
      )
    );
    
    if (updates.location) {
      const item = items.find((item) => item.id === id);
      if (item) {
        setContainers((prev) => 
          prev.map((container) => 
            container.name === item.location
              ? {
                  ...container,
                  usedCapacity: container.usedCapacity - item.volume,
                  items: container.items.filter((i) => i.id !== id)
                }
              : container
          )
        );
        
        setContainers((prev) => 
          prev.map((container) => 
            container.name === updates.location
              ? {
                  ...container,
                  usedCapacity: container.usedCapacity + item.volume,
                  items: [...container.items, { ...item, location: updates.location as string }]
                }
              : container
          )
        );
        
        addLog({
          action: 'relocate',
          itemId: id,
          itemName: item.name,
          location: updates.location,
          user: 'Current User',
          details: `Moved ${item.name} from ${item.location} to ${updates.location}`
        });
        
        toast({
          title: "Item Relocated",
          description: `${item.name} has been moved to ${updates.location}`,
        });
      }
    }
  };

  const retrieveItem = (id: string) => {
    const item = items.find((item) => item.id === id);
    if (item) {
      updateItem(id, { usageCount: item.usageCount + 1 });
      
      addLog({
        action: 'retrieve',
        itemId: id,
        itemName: item.name,
        location: item.location,
        user: 'Current User',
        details: `Retrieved ${item.name} from ${item.location}`
      });
      
      toast({
        title: "Item Retrieved",
        description: `${item.name} has been retrieved from ${item.location}`,
      });
    }
  };

  const markAsWaste = (id: string) => {
    const item = items.find((item) => item.id === id);
    if (item) {
      updateItem(id, { status: 'waste' });
      
      addLog({
        action: 'dispose',
        itemId: id,
        itemName: item.name,
        user: 'Current User',
        details: `Marked ${item.name} as waste`
      });
      
      toast({
        title: "Item Marked as Waste",
        description: `${item.name} has been marked as waste`,
      });
    }
  };

  const addContainer = (container: Omit<StorageContainer, 'id' | 'usedCapacity' | 'items'>) => {
    const newContainer: StorageContainer = {
      ...container,
      id: `container-${Date.now()}`,
      usedCapacity: 0,
      items: []
    };
    
    setContainers((prev) => [...prev, newContainer]);
    
    toast({
      title: "Container Added",
      description: `${newContainer.name} has been added to the system`,
    });
  };

  const importItems = async (csv: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',');
          
          const newItems: CargoItem[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',');
            const item: any = {};
            
            headers.forEach((header, index) => {
              const value = values[index]?.trim();
              if (header === 'priority') {
                item[header] = value.toLowerCase() as Priority;
              } else if (header === 'status') {
                item[header] = value.toLowerCase() as Status;
              } else if (header === 'weight' || header === 'volume') {
                item[header] = parseFloat(value);
              } else if (header === 'expirationDate') {
                item[header] = value ? new Date(value) : undefined;
              } else {
                item[header] = value;
              }
            });
            
            const newItem: CargoItem = {
              id: `item-${Date.now()}-${i}`,
              name: item.name || `Imported Item ${i}`,
              priority: item.priority || 'medium',
              status: item.status || 'stored',
              location: item.location || 'Unassigned',
              weight: item.weight || 0,
              volume: item.volume || 0,
              lastModified: new Date(),
              usageCount: 0,
              expirationDate: item.expirationDate
            };
            
            newItems.push(newItem);
          }
          
          setItems((prev) => [...prev, ...newItems]);
          
          newItems.forEach((item) => {
            setContainers((prev) => 
              prev.map((container) => 
                container.name === item.location
                  ? {
                      ...container,
                      usedCapacity: container.usedCapacity + item.volume,
                      items: [...container.items, item]
                    }
                  : container
              )
            );
          });
          
          toast({
            title: "Items Imported",
            description: `${newItems.length} items have been imported`,
          });
          
          resolve();
        } catch (error) {
          console.error("Error importing items:", error);
          toast({
            title: "Import Error",
            description: "There was an error importing the items. Please check the CSV format.",
            variant: "destructive"
          });
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast({
          title: "File Error",
          description: "There was an error reading the file",
          variant: "destructive"
        });
        reject(error);
      };
      
      reader.readAsText(csv);
    });
  };

  const importContainers = async (csv: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',');
          
          const newContainers: StorageContainer[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',');
            const container: any = {};
            
            headers.forEach((header, index) => {
              const value = values[index]?.trim();
              if (header === 'capacity') {
                container[header] = parseFloat(value);
              } else {
                container[header] = value;
              }
            });
            
            const newContainer: StorageContainer = {
              id: `container-${Date.now()}-${i}`,
              name: container.name || `Imported Container ${i}`,
              capacity: container.capacity || 100,
              usedCapacity: 0,
              location: container.location || 'Unassigned',
              items: []
            };
            
            newContainers.push(newContainer);
          }
          
          setContainers((prev) => [...prev, ...newContainers]);
          
          toast({
            title: "Containers Imported",
            description: `${newContainers.length} containers have been imported`,
          });
          
          resolve();
        } catch (error) {
          console.error("Error importing containers:", error);
          toast({
            title: "Import Error",
            description: "There was an error importing the containers. Please check the CSV format.",
            variant: "destructive"
          });
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast({
          title: "File Error",
          description: "There was an error reading the file",
          variant: "destructive"
        });
        reject(error);
      };
      
      reader.readAsText(csv);
    });
  };

  const exportCurrentArrangement = () => {
    try {
      let csv = 'id,name,priority,status,location,weight,volume,lastModified,usageCount,expirationDate\n';
      
      items.forEach((item) => {
        csv += `${item.id},${item.name},${item.priority},${item.status},${item.location},${item.weight},${item.volume},${item.lastModified.toISOString()},${item.usageCount},${item.expirationDate ? item.expirationDate.toISOString() : ''}\n`;
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `space-cargo-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Complete",
        description: "The current arrangement has been exported to a CSV file",
      });
    } catch (error) {
      console.error("Error exporting arrangement:", error);
      toast({
        title: "Export Error",
        description: "There was an error exporting the arrangement",
        variant: "destructive"
      });
    }
  };

  const simulateDay = () => {
    const today = new Date();
    
    const simulatedItems = simulateTimePassed(items, 1);
    setItems(simulatedItems);
    
    const newlyExpiredItems = simulatedItems.filter(item => 
      item.status === 'waste' && 
      items.find(oldItem => oldItem.id === item.id)?.status !== 'waste'
    );
    
    newlyExpiredItems.forEach(item => {
      addLog({
        action: 'dispose',
        itemId: item.id,
        itemName: item.name,
        user: 'System',
        details: `${item.name} has expired and has been marked as waste`
      });
    });
    
    toast({
      title: "Day Simulated",
      description: `One day has been simulated, checking for expirations. ${newlyExpiredItems.length} items expired.`,
    });
  };

  const simulateDays = (days: number) => {
    const simulatedItems = simulateTimePassed(items, days);
    setItems(simulatedItems);
    
    const newlyExpiredItems = simulatedItems.filter(item => 
      item.status === 'waste' && 
      items.find(oldItem => oldItem.id === item.id)?.status !== 'waste'
    );
    
    newlyExpiredItems.forEach(item => {
      addLog({
        action: 'dispose',
        itemId: item.id,
        itemName: item.name,
        user: 'System',
        details: `${item.name} has expired and has been marked as waste`
      });
    });
    
    toast({
      title: "Multiple Days Simulated",
      description: `${days} days have been simulated. ${newlyExpiredItems.length} items expired.`,
    });
  };

  const getItemsByStatus = (status: Status) => {
    return items.filter((item) => item.status === status);
  };

  const getItemsByPriority = (priority: Priority) => {
    return items.filter((item) => item.priority === priority);
  };

  const getWasteItems = () => {
    return items.filter((item) => item.status === 'waste');
  };

  const getActiveItems = () => {
    return items.filter((item) => item.status !== 'waste');
  };

  const searchItems = (query: string) => {
    return optimizeItemRetrieval(query, items);
  };

  const executeRearrangementPlan = () => {
    if (!rearrangementPlan) return;
    
    rearrangementPlan.steps.forEach(step => {
      const item = items.find(i => i.id === step.itemId);
      if (item) {
        updateItem(item.id, { location: step.toLocation });
      }
    });
    
    toast({
      title: "Rearrangement Complete",
      description: `${rearrangementPlan.steps.length} items have been rearranged`,
    });
    
    setRearrangementPlan(null);
  };

  const prepareWasteForUndocking = () => {
    const wasteItems = getWasteItems();
    const undockingLocation = "Undocking Module";
    
    if (wasteItems.length === 0) {
      toast({
        title: "No Waste Items",
        description: "There are no waste items to prepare for undocking",
      });
      return;
    }
    
    wasteItems.forEach(item => {
      updateItem(item.id, { location: undockingLocation });
    });
    
    const manifest = generateWasteManifest(wasteItems);
    setWasteManifest(manifest);
    
    toast({
      title: "Waste Prepared for Undocking",
      description: `${wasteItems.length} waste items have been moved to the Undocking Module`,
    });
    
    addLog({
      action: 'relocate',
      itemId: 'batch',
      itemName: 'Waste Batch',
      location: undockingLocation,
      user: 'Current User',
      details: `Moved ${wasteItems.length} waste items to Undocking Module for disposal`
    });
  };

  useEffect(() => {
    const newRecommendations = generatePlacementRecommendations(items, containers);
    setRecommendations(newRecommendations);
    
    const itemsNeedingRearrangement = newRecommendations.filter(
      rec => rec.recommendedContainer === 'Requires rearrangement'
    );
    
    if (itemsNeedingRearrangement.length > 0) {
      const inTransitItems = items.filter(item => item.status === 'in-transit');
      const newRearrangementPlan = generateRearrangementPlan(items, containers, inTransitItems);
      setRearrangementPlan(newRearrangementPlan);
    } else {
      setRearrangementPlan(null);
    }
    
    const newExpiringItems = identifyExpiringItems(items);
    setExpiringItems(newExpiringItems);
    
    const wasteItems = getWasteItems();
    if (wasteItems.length > 0) {
      setWasteManifest(generateWasteManifest(wasteItems));
    }
  }, [items, containers]);

  return (
    <SpaceCargoContext.Provider
      value={{
        items,
        containers,
        logs,
        recommendations,
        rearrangementPlan,
        expiringItems,
        wasteManifest,
        addItem,
        updateItem,
        retrieveItem,
        markAsWaste,
        addContainer,
        importItems,
        importContainers,
        exportCurrentArrangement,
        simulateDay,
        simulateDays,
        getItemsByStatus,
        getItemsByPriority,
        getWasteItems,
        getActiveItems,
        searchItems,
        executeRearrangementPlan,
        prepareWasteForUndocking
      }}
    >
      {children}
    </SpaceCargoContext.Provider>
  );
};

export const useSpaceCargo = (): SpaceCargoContextType => {
  const context = useContext(SpaceCargoContext);
  if (context === undefined) {
    throw new Error('useSpaceCargo must be used within a SpaceCargoProvider');
  }
  return context;
};
