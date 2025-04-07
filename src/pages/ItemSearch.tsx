import React, { useState, useMemo } from 'react';
import { Package, Search as SearchIcon, Barcode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ItemSearchFilters from '@/components/ItemSearchFilters';
import ItemCard from '@/components/ItemCard';
import { useSpaceCargo } from '@/contexts/SpaceCargoContext';

const ItemSearch = () => {
  const { items } = useSpaceCargo();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search query filter
      const matchesSearch = 
        searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Priority filter
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [items, searchQuery, priorityFilter, statusFilter]);
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Item Search & Retrieval</h1>
          <p className="text-gray-400">Find and retrieve items quickly</p>
        </div>
        
        <Button className="bg-space-blue text-white hover:bg-blue-600">
          <Barcode className="h-5 w-5 mr-2" />
          Scan Barcode
        </Button>
      </div>
      
      <div className="space-card p-6 mb-8">
        <div className="flex items-center relative">
          <SearchIcon className="h-5 w-5 absolute left-3 text-gray-400" />
          <Input
            placeholder="Search by item name, ID, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-space-darker-blue border-gray-700 text-white"
          />
        </div>
        
        <div className="mt-6">
          <ItemSearchFilters
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
        </h2>
        <span className="text-gray-400 text-sm">
          Last updated: Just now
        </span>
      </div>
      
      <div className="space-y-6">
        {filteredItems.length === 0 ? (
          <div className="space-card p-8 text-center">
            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No items found</h3>
            <p className="text-gray-400">
              Try adjusting your search or filters to find what you're looking for
            </p>
          </div>
        ) : (
          filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

export default ItemSearch;