
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface ItemSearchFiltersProps {
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const ItemSearchFilters: React.FC<ItemSearchFiltersProps> = ({
  priorityFilter,
  setPriorityFilter,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search by item name, ID, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-space-dark-blue border-gray-700 text-white"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 md:w-1/3">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="bg-space-dark-blue border-gray-700 text-white">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent className="bg-space-dark-blue border-gray-700 text-white">
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-space-dark-blue border-gray-700 text-white">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-space-dark-blue border-gray-700 text-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="stored">Stored</SelectItem>
            <SelectItem value="in-transit">In Transit</SelectItem>
            <SelectItem value="waste">Waste</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ItemSearchFilters;
