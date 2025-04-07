
import React from 'react';
import { Package } from 'lucide-react';
import { StorageContainer as StorageContainerType } from '@/types';
import { cn } from '@/lib/utils';

interface StorageContainerProps {
  container: StorageContainerType;
  onClick?: () => void;
  className?: string;
}

const StorageContainer: React.FC<StorageContainerProps> = ({ 
  container, 
  onClick,
  className 
}) => {
  const usagePercentage = (container.usedCapacity / container.capacity) * 100;
  
  // Determine color based on usage
  let borderColorClass = "border-green-500";
  if (usagePercentage > 80) {
    borderColorClass = "border-red-500";
  } else if (usagePercentage > 50) {
    borderColorClass = "border-yellow-500";
  }
  
  // All items in this container have same status?
  const allStoredItems = container.items.every(item => item.status === 'stored');
  const allWasteItems = container.items.every(item => item.status === 'waste');
  const allTransitItems = container.items.every(item => item.status === 'in-transit');
  
  // Determine background color based on status
  let bgColorClass = "bg-space-dark-blue";
  if (container.items.length > 0) {
    if (allWasteItems) {
      bgColorClass = "bg-red-900/30";
      borderColorClass = "border-red-500";
    } else if (allTransitItems) {
      bgColorClass = "bg-blue-900/30";
      borderColorClass = "border-blue-500";
    } else if (allStoredItems) {
      if (container.items.some(item => item.priority === 'high')) {
        bgColorClass = "bg-red-900/30";
        borderColorClass = "border-red-500";
      } else if (container.items.some(item => item.priority === 'medium')) {
        bgColorClass = "bg-yellow-900/30";
        borderColorClass = "border-yellow-500";
      } else {
        bgColorClass = "bg-green-900/30";
        borderColorClass = "border-green-500";
      }
    }
  }
  
  return (
    <div 
      className={cn(
        "p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg",
        borderColorClass,
        bgColorClass,
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <Package className="h-10 w-10 text-space-blue mb-2" />
        <h3 className="text-lg font-medium">{container.name}</h3>
        <p className="text-gray-400">
          {container.items.length === 0 ? 'empty' : 
            container.items.some(item => item.status === 'waste') ? 'waste' :
            container.items.some(item => item.status === 'in-transit') ? 'in-transit' :
            'stored'
          }
        </p>
      </div>
      
      <div className="mt-4">
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className={cn(
              "h-2 rounded-full",
              usagePercentage > 80 ? "bg-red-500" :
              usagePercentage > 50 ? "bg-yellow-500" :
              "bg-green-500"
            )}
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
        <div className="mt-1 text-xs text-gray-400 flex justify-between">
          <span>{usagePercentage.toFixed(0)}% Used</span>
          <span>{container.usedCapacity}/{container.capacity}m³</span>
        </div>
      </div>
      
      {container.items.length > 0 && (
        <div className="mt-3 text-sm">
          <p>{container.items.length} item{container.items.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  );
};

export default StorageContainer;
