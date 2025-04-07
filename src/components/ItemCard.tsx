
import React from 'react';
import { Package } from 'lucide-react';
import { CargoItem } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSpaceCargo } from '@/contexts/SpaceCargoContext';

interface ItemCardProps {
  item: CargoItem;
  showActions?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, showActions = true }) => {
  const { retrieveItem, markAsWaste } = useSpaceCargo();
  
  const priorityClass = {
    high: 'priority-high',
    medium: 'priority-medium',
    low: 'priority-low'
  }[item.priority];
  
  const statusClass = {
    stored: 'status-stored',
    'in-transit': 'text-space-blue',
    waste: 'status-waste'
  }[item.status];
  
  return (
    <div className="space-card p-4 mb-4">
      <div className="flex items-start">
        <div className="bg-space-blue/20 p-3 rounded-lg mr-4">
          <Package className="h-6 w-6 text-space-blue" />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{item.name}</h3>
              <p className="text-gray-400">{item.location}</p>
            </div>
            
            {item.priority === 'high' && (
              <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-medium">
                High Priority
              </span>
            )}
            
            {item.priority === 'medium' && (
              <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs font-medium">
                Medium Priority
              </span>
            )}
            
            {item.priority === 'low' && (
              <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs font-medium">
                Low Priority
              </span>
            )}
          </div>
          
          <div className="mt-3 text-sm text-gray-400">
            <div className="flex space-x-6">
              <div>
                <span className="block">Weight: {item.weight}kg</span>
                <span className="block">Volume: {item.volume}m³</span>
              </div>
              <div>
                <span className="block">Status: <span className={statusClass}>{item.status}</span></span>
                <span className="block">Usage Count: {item.usageCount}</span>
              </div>
            </div>
            <div className="mt-2">
              <span className="block">Last Modified: {item.lastModified.toLocaleString()}</span>
            </div>
          </div>
          
          {showActions && item.status !== 'waste' && (
            <div className="mt-4 flex space-x-3">
              <Button 
                className="bg-space-blue text-white hover:bg-blue-600 px-4 py-2 rounded-md"
                onClick={() => retrieveItem(item.id)}
              >
                Retrieve
              </Button>
              <Button 
                variant="destructive" 
                className="hover:bg-red-600"
                onClick={() => markAsWaste(item.id)}
              >
                Mark as Waste
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
