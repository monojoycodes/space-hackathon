import React, { useState } from 'react';
import { FileText, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import ActionLogItem from '@/components/ActionLogItem';
import { useSpaceCargo } from '@/contexts/SpaceCargoContext';

const Logs = () => {
  const { logs } = useSpaceCargo();
  const [actionFilter, setActionFilter] = useState('all');
  
  const filteredLogs = logs.filter(log => 
    actionFilter === 'all' || log.action === actionFilter
  );
  
  // Group logs by date
  const groupedLogs: Record<string, typeof logs> = {};
  
  filteredLogs.forEach(log => {
    const dateKey = log.timestamp.toDateString();
    if (!groupedLogs[dateKey]) {
      groupedLogs[dateKey] = [];
    }
    groupedLogs[dateKey].push(log);
  });
  
  const sortedDates = Object.keys(groupedLogs).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-gray-400">Track all actions performed on cargo items</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <Card className="bg-space-dark-blue border-gray-800 flex-1">
          <CardHeader>
            <CardTitle>{logs.length}</CardTitle>
            <CardDescription>Total Activity Logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-400">
              From {logs.length > 0 
                ? new Date(Math.min(...logs.map(l => l.timestamp.getTime()))).toLocaleDateString() 
                : 'N/A'
              }
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-space-dark-blue border-gray-800 flex-1">
          <CardHeader>
            <CardTitle>Filter Logs</CardTitle>
            <CardDescription>Filter by action type</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="bg-space-darker-blue border-gray-700 text-white">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent className="bg-space-dark-blue border-gray-700 text-white">
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="place">Placement</SelectItem>
                <SelectItem value="retrieve">Retrieval</SelectItem>
                <SelectItem value="relocate">Relocation</SelectItem>
                <SelectItem value="dispose">Disposal</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-8">
        {sortedDates.length === 0 ? (
          <div className="space-card p-8 text-center">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No logs found</h3>
            <p className="text-gray-400">
              No activity logs match your current filter
            </p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date}>
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 mr-2 text-space-blue" />
                <h2 className="text-xl font-medium">{date}</h2>
              </div>
              
              <div className="space-y-3">
                {groupedLogs[date].map(log => (
                  <ActionLogItem key={log.id} log={log} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Logs;