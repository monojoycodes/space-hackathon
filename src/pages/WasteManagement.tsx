import React, { useState } from 'react';
import { Trash, Box, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '../services/apiService';
import ItemCard from '@/components/ItemCard';

const WasteManagement = () => {
  const [wasteItems, setWasteItems] = useState([]);
  const [returnPlan, setReturnPlan] = useState(null);
  const [message, setMessage] = useState('');

  const handleIdentifyWaste = async () => {
    try {
      const response = await apiService.identifyWasteItems();
      setWasteItems(response.wasteItems);
      setMessage('');
    } catch (error) {
      setMessage('Error identifying waste items');
    }
  };

  const handleCreateReturnPlan = async () => {
    try {
      const response = await apiService.createReturnPlan({
        undockingContainerId: 'someContainerId',
        undockingDate: '2025-04-07T17:00:00',
        maxWeight: 100
      });
      setReturnPlan(response.returnPlan);
      setMessage('');
    } catch (error) {
      setMessage('Error creating return plan');
    }
  };

  const handleCompleteUndocking = async () => {
    try {
      const response = await apiService.completeUndocking({
        undockingContainerId: 'someContainerId',
        timestamp: '2025-04-07T17:00:00'
      });
      setMessage('Undocking completed successfully');
    } catch (error) {
      setMessage('Error completing undocking');
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Waste Management</h1>
          <p className="text-gray-400">Track and dispose of waste items</p>
        </div>
        <Button className="bg-space-blue text-white hover:bg-blue-600" onClick={handleIdentifyWaste}>
          Identify Waste Items
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-space-dark-blue border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-space-red mr-2">{wasteItems.length}</span>
              <span>Waste Items</span>
            </CardTitle>
            <CardDescription>Items marked for disposal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-400">
              {wasteItems.reduce((total, item) => total + item.volume, 0).toFixed(2)}m³ of waste volume
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-space-dark-blue border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-space-green mr-2">{wasteItems.length}</span>
              <span>Return Plan</span>
            </CardTitle>
            <CardDescription>Items scheduled for return</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-400">
              {wasteItems.reduce((total, item) => total + item.volume, 0).toFixed(2)}m³ of return volume
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Button className="bg-space-blue text-white hover:bg-blue-600" onClick={handleCreateReturnPlan}>
          Create Return Plan
        </Button>
        <Button className="bg-space-blue text-white hover:bg-blue-600 ml-4" onClick={handleCompleteUndocking}>
          Complete Undocking
        </Button>
      </div>

      {message && <p className="text-center mt-4 text-green-500">{message}</p>}
    </div>
  );
};

export default WasteManagement;