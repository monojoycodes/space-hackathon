import React from 'react';
import { RotateCcw, MoveRight, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useSpaceCargo } from '@/contexts/SpaceCargoContext';
import { useToast } from "@/hooks/use-toast";
import ItemCard from '@/components/ItemCard';

const Rearrangement = () => {
  const { 
    rearrangementPlan, 
    items, 
    containers, 
    getItemsByStatus,
    executeRearrangementPlan
  } = useSpaceCargo();
  
  const { toast } = useToast();
  
  const inTransitItems = getItemsByStatus('in-transit');
  
  // Calculate space stats
  const totalSpace = containers.reduce((sum, container) => sum + container.capacity, 0);
  const usedSpace = containers.reduce((sum, container) => sum + container.usedCapacity, 0);
  const availableSpace = totalSpace - usedSpace;
  const spacePercentage = (usedSpace / totalSpace) * 100;
}
  // Space needed for transit