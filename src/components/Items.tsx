import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Item, SimulationRequest } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from './ui/use-toast';

export function Items() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [simulationDays, setSimulationDays] = useState<number>(1);
  const queryClient = useQueryClient();

  // Query for items
  const { data: items = [], isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      const response = await api.searchItem();
      return response as Item[];
    },
  });

  // Mutation for importing items
  const importMutation = useMutation({
    mutationFn: (file: File) => api.importItems(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast({
        title: 'Success',
        description: 'Items imported successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to import items',
        variant: 'destructive',
      });
    },
  });

  // Mutation for simulating days
  const simulateMutation = useMutation({
    mutationFn: (request: SimulationRequest) => api.simulateDay(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast({
        title: 'Simulation Complete',
        description: `Simulated ${simulationDays} days successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to simulate days',
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  const handleSimulate = () => {
    const request: SimulationRequest = {
      numOfDays: simulationDays,
      itemsToBeUsedPerDay: [], // You can add items to be used per day here
    };
    simulateMutation.mutate(request);
  };

  if (itemsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Import Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            <Button onClick={handleImport} disabled={!selectedFile}>
              Import
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Simulate Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="number"
              min="1"
              value={simulationDays}
              onChange={(e) => setSimulationDays(parseInt(e.target.value))}
            />
            <Button onClick={handleSimulate}>
              Simulate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Usage Limit</TableHead>
                <TableHead>Preferred Zone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: Item) => (
                <TableRow key={item.itemId}>
                  <TableCell>{item.itemId}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{`${item.width}x${item.depth}x${item.height}`}</TableCell>
                  <TableCell>{item.priority}</TableCell>
                  <TableCell>{item.expiryDate || 'N/A'}</TableCell>
                  <TableCell>{item.usageLimit || 'N/A'}</TableCell>
                  <TableCell>{item.preferredZone || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 