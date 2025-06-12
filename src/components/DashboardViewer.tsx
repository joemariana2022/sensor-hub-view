
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Gauge, 
  TrendingUp, 
  Wifi, 
  RefreshCw,
  BarChart3,
  LineChart
} from 'lucide-react';
import DataChart from '@/components/DataChart';

interface Field {
  name: string;
  type: 'numeric' | 'text' | 'boolean';
  initialValue: string | number | boolean;
}

interface Widget {
  id: number;
  type: 'chart' | 'numeric' | 'bar';
  config: any;
}

interface Channel {
  id: number;
  name: string;
  fields: Field[];
  apiKey: string;
  lastUpdate: string;
  widgets: Widget[];
}

interface DashboardViewerProps {
  channel: Channel;
  onUpdateChannel: (channelId: number, updatedData: Partial<Channel>) => void;
}

const DashboardViewer: React.FC<DashboardViewerProps> = ({ channel, onUpdateChannel }) => {
  const [liveData, setLiveData] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate mock live data for demonstration
  const generateMockData = () => {
    const mockData: Record<string, number> = {};
    channel.fields.forEach(field => {
      if (field.type === 'numeric') {
        const baseValue = Number(field.initialValue) || 0;
        // Add some variation to simulate live data
        mockData[field.name] = baseValue + (Math.random() - 0.5) * baseValue * 0.2;
      }
    });
    return mockData;
  };

  // Simulate real-time data updates
  useEffect(() => {
    const updateData = () => {
      setLiveData(generateMockData());
    };
    
    // Initial data
    updateData();
    
    // Update every 3 seconds
    const interval = setInterval(updateData, 3000);
    
    return () => clearInterval(interval);
  }, [channel]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLiveData(generateMockData());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getFieldUnit = (fieldName: string) => {
    switch (fieldName.toLowerCase()) {
      case 'temperature': return '°C';
      case 'pressure': return 'bar';
      case 'level': return '%';
      case 'humidity': return '%';
      case 'ph': return 'pH';
      default: return '';
    }
  };

  const generateChartData = (fieldName: string) => {
    const data = [];
    const labels = [];
    const currentValue = liveData[fieldName] || 0;
    
    // Generate 20 data points for the chart
    for (let i = 19; i >= 0; i--) {
      const time = new Date(Date.now() - i * 60000); // Every minute
      labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
      // Generate variation around current value
      const variation = (Math.random() - 0.5) * currentValue * 0.15;
      data.push(currentValue + variation);
    }
    
    return { data, labels };
  };

  const renderWidget = (widget: Widget) => {
    const fieldValue = liveData[widget.config.field] || 0;
    
    switch (widget.type) {
      case 'numeric':
        return (
          <Card key={widget.id} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Gauge className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="font-semibold text-lg">
                  {widget.config.title || widget.config.field}
                </h3>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-1">
                {fieldValue.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">
                {widget.config.unit || getFieldUnit(widget.config.field)}
              </div>
            </CardContent>
          </Card>
        );
        
      case 'chart':
        const chartData = generateChartData(widget.config.field);
        return (
          <Card key={widget.id} className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="h-5 w-5 mr-2" />
                {widget.config.title || `${widget.config.field} Chart`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataChart
                data={chartData.data}
                labels={chartData.labels}
                title={widget.config.title || widget.config.field}
                type={widget.config.chartType || 'line'}
                color="#2563eb"
              />
            </CardContent>
          </Card>
        );
        
      case 'bar':
        const barData = generateChartData(widget.config.field);
        return (
          <Card key={widget.id} className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                {widget.config.title || `${widget.config.field} Bar Chart`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataChart
                data={barData.data.slice(-8)} // Show last 8 values for bar chart
                labels={barData.labels.slice(-8)}
                title={widget.config.title || widget.config.field}
                type="bar"
                color="#059669"
              />
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };

  const numericFields = channel.fields.filter(field => field.type === 'numeric');

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{channel.name}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Wifi className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Field Values Overview */}
      {numericFields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {numericFields.map((field) => (
            <Card key={field.name} className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Gauge className="h-4 w-4 text-primary mr-2" />
                  <h3 className="font-semibold capitalize">{field.name}</h3>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {(liveData[field.name] || 0).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {getFieldUnit(field.name)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Widgets */}
      {channel.widgets.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Widgets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channel.widgets.map(renderWidget)}
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Widgets Configured</h3>
          <p className="text-muted-foreground">
            Add widgets to visualize your data in charts and graphs.
          </p>
        </Card>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Statistics Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-semibold text-lg mb-2">Current Values</h4>
              {numericFields.map(field => (
                <div key={field.name} className="flex justify-between items-center py-1">
                  <span className="capitalize">{field.name}:</span>
                  <span className="font-semibold">
                    {(liveData[field.name] || 0).toFixed(1)} {getFieldUnit(field.name)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold text-lg mb-2 text-blue-600">Estimated Min (24h)</h4>
              {numericFields.map(field => (
                <div key={field.name} className="flex justify-between items-center py-1">
                  <span className="capitalize">{field.name}:</span>
                  <span className="font-semibold text-blue-600">
                    {((liveData[field.name] || 0) * 0.85).toFixed(1)} {getFieldUnit(field.name)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold text-lg mb-2 text-red-600">Estimated Max (24h)</h4>
              {numericFields.map(field => (
                <div key={field.name} className="flex justify-between items-center py-1">
                  <span className="capitalize">{field.name}:</span>
                  <span className="font-semibold text-red-600">
                    {((liveData[field.name] || 0) * 1.15).toFixed(1)} {getFieldUnit(field.name)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardViewer;
