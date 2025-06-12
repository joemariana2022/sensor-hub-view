
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { 
  BarChart3, 
  Gauge, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit, 
  MoveUp, 
  MoveDown,
  LineChart,
  Activity
} from 'lucide-react';

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

interface WidgetManagerProps {
  channel: Channel;
  onUpdateChannel: (channelId: number, updatedData: Partial<Channel>) => void;
}

const WidgetManager: React.FC<WidgetManagerProps> = ({ channel, onUpdateChannel }) => {
  const [widgets, setWidgets] = useState<Widget[]>(channel.widgets);
  const [newWidget, setNewWidget] = useState({
    type: 'chart' as Widget['type'],
    config: {}
  });

  const numericFields = channel.fields.filter(field => field.type === 'numeric');

  const getDefaultConfig = (type: Widget['type']) => {
    switch (type) {
      case 'chart':
        return {
          chartType: 'line',
          field: numericFields[0]?.name || '',
          timeRange: '24h',
          aggregationInterval: '1h',
          title: '',
          xAxisLabel: 'Time',
          yAxisLabel: 'Value'
        };
      case 'numeric':
        return {
          field: numericFields[0]?.name || '',
          title: '',
          unit: ''
        };
      case 'bar':
        return {
          field: numericFields[0]?.name || '',
          aggregationType: 'average',
          title: '',
          xAxisLabel: 'Categories',
          yAxisLabel: 'Values'
        };
      default:
        return {};
    }
  };

  const addWidget = () => {
    if (!newWidget.config.field) {
      toast({ title: "Error", description: "Please select a field for the widget.", variant: "destructive" });
      return;
    }

    const widget: Widget = {
      id: Date.now(),
      type: newWidget.type,
      config: { ...getDefaultConfig(newWidget.type), ...newWidget.config }
    };

    const updatedWidgets = [...widgets, widget];
    setWidgets(updatedWidgets);
    onUpdateChannel(channel.id, { widgets: updatedWidgets });
    
    // Reset form
    setNewWidget({ type: 'chart', config: {} });
    
    toast({ title: "Widget Added", description: "Widget has been added to the dashboard." });
  };

  const removeWidget = (widgetId: number) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(updatedWidgets);
    onUpdateChannel(channel.id, { widgets: updatedWidgets });
    
    toast({ title: "Widget Removed", description: "Widget has been removed from the dashboard." });
  };

  const moveWidget = (widgetId: number, direction: 'up' | 'down') => {
    const currentIndex = widgets.findIndex(w => w.id === widgetId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === widgets.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedWidgets = [...widgets];
    [updatedWidgets[currentIndex], updatedWidgets[newIndex]] = 
    [updatedWidgets[newIndex], updatedWidgets[currentIndex]];
    
    setWidgets(updatedWidgets);
    onUpdateChannel(channel.id, { widgets: updatedWidgets });
    
    toast({ title: "Widget Moved", description: `Widget moved ${direction}.` });
  };

  const updateWidgetConfig = (widgetId: number, config: any) => {
    const updatedWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, config: { ...w.config, ...config } } : w
    );
    setWidgets(updatedWidgets);
    onUpdateChannel(channel.id, { widgets: updatedWidgets });
  };

  const getWidgetIcon = (type: Widget['type']) => {
    switch (type) {
      case 'chart': return <LineChart className="h-4 w-4" />;
      case 'numeric': return <Gauge className="h-4 w-4" />;
      case 'bar': return <BarChart3 className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const renderWidgetForm = () => {
    const config = { ...getDefaultConfig(newWidget.type), ...newWidget.config };

    return (
      <div className="space-y-4">
        <div>
          <Label>Widget Type</Label>
          <Select
            value={newWidget.type}
            onValueChange={(value) => {
              setNewWidget({ 
                type: value as Widget['type'], 
                config: getDefaultConfig(value as Widget['type'])
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chart">Chart (Line/Area/Scatter)</SelectItem>
              <SelectItem value="numeric">Numeric Display</SelectItem>
              <SelectItem value="bar">Bar Graph</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Field Selection</Label>
          <Select
            value={config.field}
            onValueChange={(value) => 
              setNewWidget(prev => ({ ...prev, config: { ...prev.config, field: value } }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a numeric field" />
            </SelectTrigger>
            <SelectContent>
              {numericFields.map((field) => (
                <SelectItem key={field.name} value={field.name}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Title</Label>
          <Input
            value={config.title}
            onChange={(e) => 
              setNewWidget(prev => ({ ...prev, config: { ...prev.config, title: e.target.value } }))
            }
            placeholder="Widget title"
          />
        </div>

        {newWidget.type === 'chart' && (
          <>
            <div>
              <Label>Chart Type</Label>
              <Select
                value={config.chartType}
                onValueChange={(value) => 
                  setNewWidget(prev => ({ ...prev, config: { ...prev.config, chartType: value } }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Time Range</Label>
                <Select
                  value={config.timeRange}
                  onValueChange={(value) => 
                    setNewWidget(prev => ({ ...prev, config: { ...prev.config, timeRange: value } }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Aggregation Interval</Label>
                <Select
                  value={config.aggregationInterval}
                  onValueChange={(value) => 
                    setNewWidget(prev => ({ ...prev, config: { ...prev.config, aggregationInterval: value } }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 Minute</SelectItem>
                    <SelectItem value="5m">5 Minutes</SelectItem>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="1d">1 Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>X-Axis Label</Label>
                <Input
                  value={config.xAxisLabel}
                  onChange={(e) => 
                    setNewWidget(prev => ({ ...prev, config: { ...prev.config, xAxisLabel: e.target.value } }))
                  }
                  placeholder="X-axis label"
                />
              </div>

              <div>
                <Label>Y-Axis Label</Label>
                <Input
                  value={config.yAxisLabel}
                  onChange={(e) => 
                    setNewWidget(prev => ({ ...prev, config: { ...prev.config, yAxisLabel: e.target.value } }))
                  }
                  placeholder="Y-axis label"
                />
              </div>
            </div>
          </>
        )}

        {newWidget.type === 'numeric' && (
          <div>
            <Label>Unit</Label>
            <Input
              value={config.unit}
              onChange={(e) => 
                setNewWidget(prev => ({ ...prev, config: { ...prev.config, unit: e.target.value } }))
              }
              placeholder="e.g., °C, %, bar"
            />
          </div>
        )}

        {newWidget.type === 'bar' && (
          <>
            <div>
              <Label>Aggregation Type</Label>
              <Select
                value={config.aggregationType}
                onValueChange={(value) => 
                  setNewWidget(prev => ({ ...prev, config: { ...prev.config, aggregationType: value } }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="min">Minimum</SelectItem>
                  <SelectItem value="max">Maximum</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>X-Axis Label</Label>
                <Input
                  value={config.xAxisLabel}
                  onChange={(e) => 
                    setNewWidget(prev => ({ ...prev, config: { ...prev.config, xAxisLabel: e.target.value } }))
                  }
                  placeholder="X-axis label"
                />
              </div>

              <div>
                <Label>Y-Axis Label</Label>
                <Input
                  value={config.yAxisLabel}
                  onChange={(e) => 
                    setNewWidget(prev => ({ ...prev, config: { ...prev.config, yAxisLabel: e.target.value } }))
                  }
                  placeholder="Y-axis label"
                />
              </div>
            </div>
          </>
        )}

        <Button onClick={addWidget} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Widget
        </Button>
      </div>
    );
  };

  return (
    <Tabs defaultValue="create" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="create">Create Widget</TabsTrigger>
        <TabsTrigger value="manage">Manage Layout</TabsTrigger>
      </TabsList>

      <TabsContent value="create" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Create New Widget</CardTitle>
          </CardHeader>
          <CardContent>
            {numericFields.length === 0 ? (
              <div className="text-center py-8">
                <Gauge className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No numeric fields available. Add numeric fields to the dashboard to create widgets.
                </p>
              </div>
            ) : (
              renderWidgetForm()
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manage" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Widget Layout ({widgets.length} widgets)</CardTitle>
          </CardHeader>
          <CardContent>
            {widgets.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No widgets configured. Create widgets using the "Create Widget" tab.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {widgets.map((widget, index) => (
                  <div key={widget.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getWidgetIcon(widget.type)}
                      <div>
                        <div className="font-medium">
                          {widget.config.title || `${widget.type.charAt(0).toUpperCase() + widget.type.slice(1)} Widget`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Field: {widget.config.field} | Type: {widget.type}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveWidget(widget.id, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveWidget(widget.id, 'down')}
                        disabled={index === widgets.length - 1}
                      >
                        <MoveDown className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeWidget(widget.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default WidgetManager;
