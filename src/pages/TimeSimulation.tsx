import React, { useState } from 'react';
import { Clock, Calendar, ArrowRight, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiService } from '../services/apiService';

const TimeSimulation = () => {
  const [simulateDaysValue, setSimulateDaysValue] = useState(7);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [message, setMessage] = useState('');

  const simulateDay = async () => {
    try {
      const response = await apiService.simulateDay({ days: 1 });
      setMessage(response.message);
      setCurrentDate(new Date(currentDate.getTime() + 86400000));
    } catch (error) {
      console.error('Error simulating day:', error);
      setMessage('Error simulating day');
    }
  };

  const simulateDays = async (days: number) => {
    try {
      const response = await apiService.simulateDay({ days });
      setMessage(response.message);
      setCurrentDate(new Date(currentDate.getTime() + days * 86400000));
    } catch (error) {
      console.error('Error simulating days:', error);
      setMessage('Error simulating days');
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Time Simulation</h1>
          <p className="text-gray-400">Simulate time passage to test system behavior</p>
        </div>
      </div>
      
      <Alert className="bg-blue-500/20 border-blue-500 mb-8">
        <Info className="h-5 w-5 text-blue-500" />
        <AlertTitle className="text-blue-500">Simulation Mode</AlertTitle>
        <AlertDescription>
          This feature simulates the passage of time to see how the system handles expiration dates and usage counts. No actual items will be physically moved or affected.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-space-dark-blue border-gray-800">
          <CardHeader>
            <CardTitle>Current Date</CardTitle>
            <CardDescription>In simulation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-space-blue" />
              {currentDate.toDateString()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-space-dark-blue border-gray-800">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current simulation state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg">
              <span className="text-space-green font-medium">Active</span>
              <span className="text-gray-400"> - Simulating time</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-space-dark-blue border-gray-800">
          <CardHeader>
            <CardTitle>Simulate One Day</CardTitle>
            <CardDescription>Advance time by a single day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 mr-2 text-space-blue" />
                  <div>
                    <p>Current: {currentDate.toDateString()}</p>
                    <p className="text-gray-400">After: {new Date(currentDate.getTime() + 86400000).toDateString()}</p>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  This will check for expirations and update usage counts for a single day.
                </p>
                <Button 
                  className="w-full bg-space-blue text-white hover:bg-blue-600"
                  onClick={simulateDay}
                >
                  Simulate One Day
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-space-dark-blue border-gray-800">
          <CardHeader>
            <CardTitle>Simulate Multiple Days</CardTitle>
            <CardDescription>Advance time by a custom number of days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="days">Number of Days</Label>
                <div className="flex space-x-3 mt-1">
                  <Input 
                    id="days"
                    type="number"
                    min="1"
                    max="365"
                    value={simulateDaysValue}
                    onChange={(e) => setSimulateDaysValue(parseInt(e.target.value) || 1)}
                    className="bg-space-darker-blue border-gray-700 text-white"
                  />
                  <Button 
                    className="bg-space-blue text-white hover:bg-blue-600 flex-shrink-0"
                    onClick={() => simulateDays(simulateDaysValue)}
                  >
                    Simulate
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p>Current: {currentDate.toDateString()}</p>
                  <p className="text-gray-400">
                    After: {new Date(currentDate.getTime() + (simulateDaysValue * 86400000)).toDateString()}
                  </p>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-space-dark-blue border-gray-800">
        <CardHeader>
          <CardTitle>Simulation Effects</CardTitle>
          <CardDescription>What happens during time simulation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Expiration Dates</h3>
              <p className="text-gray-400">
                Items with expiration dates that pass during the simulation will be automatically marked as waste.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Usage Counts</h3>
              <p className="text-gray-400">
                The system will estimate typical daily usage for consumable items based on historical data and reduce their counts accordingly.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Automatic Logs</h3>
              <p className="text-gray-400">
                The system will generate logs for any significant events that occur during the simulation, such as items expiring or being depleted.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {message && <p className="text-center mt-4 text-green-500">{message}</p>}
    </div>
  );
};

export default TimeSimulation;