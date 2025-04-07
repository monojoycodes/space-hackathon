
import React from 'react';
import { Package, ArrowRight, Trash, RotateCcw } from 'lucide-react';
import { ActionLog } from '@/types';

interface ActionLogItemProps {
  log: ActionLog;
}

const ActionLogItem: React.FC<ActionLogItemProps> = ({ log }) => {
  const getIcon = () => {
    switch (log.action) {
      case 'place':
        return <Package className="h-5 w-5 text-space-blue" />;
      case 'retrieve':
        return <ArrowRight className="h-5 w-5 text-space-green" />;
      case 'dispose':
        return <Trash className="h-5 w-5 text-space-red" />;
      case 'relocate':
        return <RotateCcw className="h-5 w-5 text-space-yellow" />;
      default:
        return <Package className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getActionText = () => {
    switch (log.action) {
      case 'place':
        return `Placed ${log.itemName}`;
      case 'retrieve':
        return `Retrieved ${log.itemName}`;
      case 'dispose':
        return `Disposed ${log.itemName}`;
      case 'relocate':
        return `Relocated ${log.itemName}`;
      default:
        return `Action on ${log.itemName}`;
    }
  };
  
  return (
    <div className="space-card p-4 mb-3">
      <div className="flex items-start">
        <div className="bg-space-darker-blue p-2 rounded mr-3">
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{getActionText()}</h4>
              <p className="text-sm text-gray-400">
                {log.location && `Location: ${log.location}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">{log.timestamp.toLocaleString()}</p>
              <p className="text-xs text-gray-400">By: {log.user}</p>
            </div>
          </div>
          
          {log.details && (
            <p className="text-sm text-gray-400 mt-2">{log.details}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionLogItem;
