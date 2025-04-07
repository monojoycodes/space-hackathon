import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, RotateCcw, Trash, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSpaceCargo } from '@/contexts/SpaceCargoContext';

const Dashboard = () => {
  const { 
    items, 
    containers, 
    logs, 
    getWasteItems, 
    getActiveItems,
    getItemsByStatus
  } = useSpaceCargo();
  
  const totalItems = items.length;
  const wasteItems = getWasteItems().length;
  const activeItems = getActiveItems().length;
  const totalContainers = containers.length;
  const transitItems = getItemsByStatus('in-transit').length;
  
  // Calculate total and used capacity
  const totalCapacity = containers.reduce((sum, container) => sum + container.capacity, 0);
  const usedCapacity = containers.reduce((sum, container) => sum + container.usedCapacity, 0);
  const capacityPercentage = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;
  
  return (
    <div className="container mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Space Cargo Management</h1>
        <p className="text-xl text-gray-400">Next-generation cargo tracking and management system for space logistics</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="bg-space-dark-blue border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{totalItems}</CardTitle>
            <CardDescription>Total Items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{activeItems} Active</span>
              <span>{wasteItems} Waste</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-space-dark-blue border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{totalContainers}</CardTitle>
            <CardDescription>Storage Containers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  capacityPercentage > 80 ? "bg-red-500" :
                  capacityPercentage > 50 ? "bg-yellow-500" :
                  "bg-green-500"
                }`}
                style={{ width: `${capacityPercentage}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs text-gray-400">
              {capacityPercentage.toFixed(0)}% Capacity Used
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-space-dark-blue border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{transitItems}</CardTitle>
            <CardDescription>Items In Transit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-400">
              Awaiting Placement
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-space-dark-blue border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{logs.length}</CardTitle>
            <CardDescription>Activity Logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-400">
              Last activity: {logs.length > 0 ? logs[0].timestamp.toLocaleDateString() : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            to="/cargo-placement" 
            className="bg-space-dark-blue hover:bg-gray-800 transition-colors p-6 rounded-lg border border-gray-800 flex flex-col items-center"
          >
            <Package className="h-10 w-10 text-space-blue mb-3" />
            <h3 className="text-lg font-medium">Manage Cargo</h3>
            <p className="text-gray-400 text-sm text-center mt-2">
              Upload, place, and manage cargo items
            </p>
          </Link>
          
          <Link 
            to="/item-search" 
            className="bg-space-dark-blue hover:bg-gray-800 transition-colors p-6 rounded-lg border border-gray-800 flex flex-col items-center"
          >
            <Search className="h-10 w-10 text-space-blue mb-3" />
            <h3 className="text-lg font-medium">Search Items</h3>
            <p className="text-gray-400 text-sm text-center mt-2">
              Find and retrieve items quickly
            </p>
          </Link>
          
          <Link 
            to="/time-simulation" 
            className="bg-space-dark-blue hover:bg-gray-800 transition-colors p-6 rounded-lg border border-gray-800 flex flex-col items-center"
          >
            <Clock className="h-10 w-10 text-space-blue mb-3" />
            <h3 className="text-lg font-medium">Simulate Time</h3>
            <p className="text-gray-400 text-sm text-center mt-2">
              Test system with time progression
            </p>
          </Link>
        </div>
      </div>
      
      {/* Recent logs */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <Link to="/logs" className="text-space-blue hover:underline">
            View All
          </Link>
        </div>
        
        <div className="bg-space-dark-blue rounded-lg border border-gray-800 p-4">
          {logs.slice(0, 3).map((log) => (
            <div key={log.id} className="border-b border-gray-800 last:border-0 py-3">
              <div className="flex justify-between items-start">
                <div>
                  <p>{log.action.charAt(0).toUpperCase() + log.action.slice(1)} - {log.itemName}</p>
                  <p className="text-sm text-gray-400">{log.details}</p>
                </div>
                <div className="text-sm text-gray-400">
                  {log.timestamp.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          
          {logs.length === 0 && (
            <p className="text-gray-400">No activity logs yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;