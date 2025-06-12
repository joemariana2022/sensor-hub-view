import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { 
  Activity, 
  Eye, 
  Edit, 
  Trash2, 
  Wifi, 
  Plus, 
  X, 
  Copy, 
  Key,
  Settings,
  Layers,
  Monitor
} from 'lucide-react';
import WidgetManager from '@/components/WidgetManager';
import DashboardViewer from '@/components/DashboardViewer';

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

interface DashboardListProps {
  channels: Channel[];
  onUpdateChannel: (channelId: number, updatedData: Partial<Channel>) => void;
  onDeleteChannel: (channelId: number) => void;
}

const DashboardList: React.FC<DashboardListProps> = ({ 
  channels, 
  onUpdateChannel, 
  onDeleteChannel 
}) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showWidgets, setShowWidgets] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [editFields, setEditFields] = useState<Field[]>([]);

  const handleViewDetails = (channel: Channel) => {
    setSelectedChannel(channel);
    setShowDetails(true);
  };

  const handleViewDashboard = (channel: Channel) => {
    setSelectedChannel(channel);
    setShowViewer(true);
  };

  const handleEditFields = (channel: Channel) => {
    setSelectedChannel(channel);
    setEditFields([...channel.fields]);
    setShowEdit(true);
  };

  const handleManageWidgets = (channel: Channel) => {
    setSelectedChannel(channel);
    setShowWidgets(true);
  };

  const handleDeleteDashboard = (channel: Channel) => {
    setSelectedChannel(channel);
    setShowDelete(true);
  };

  const confirmDelete = () => {
    if (selectedChannel) {
      onDeleteChannel(selectedChannel.id);
      setShowDelete(false);
      setSelectedChannel(null);
    }
  };

  const saveFieldChanges = () => {
    if (selectedChannel) {
      onUpdateChannel(selectedChannel.id, { fields: editFields });
      setShowEdit(false);
      setSelectedChannel(null);
    }
  };

  const addField = () => {
    setEditFields([...editFields, { name: '', type: 'numeric', initialValue: 0 }]);
  };

  const updateField = (index: number, field: Partial<Field>) => {
    const newFields = [...editFields];
    newFields[index] = { ...newFields[index], ...field };
    setEditFields(newFields);
  };

  const removeField = (index: number) => {
    if (editFields.length > 1) {
      setEditFields(editFields.filter((_, i) => i !== index));
    }
  };

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast({ title: "Copied!", description: "API key copied to clipboard." });
  };

  const getDefaultValue = (type: string) => {
    switch (type) {
      case 'numeric': return 0;
      case 'boolean': return false;
      default: return '';
    }
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <Card key={channel.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>{channel.name}</span>
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Fields ({channel.fields.length}):</p>
                <div className="flex flex-wrap gap-1">
                  {channel.fields.slice(0, 3).map((field, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {field.name}
                    </Badge>
                  ))}
                  {channel.fields.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{channel.fields.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Widgets:</p>
                <Badge variant="outline" className="text-xs">
                  {channel.widgets.length} configured
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Last update: {channel.lastUpdate}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewDashboard(channel)}
                >
                  <Monitor className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewDetails(channel)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEditFields(channel)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleManageWidgets(channel)}
                >
                  <Layers className="h-3 w-3 mr-1" />
                  Widgets
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleDeleteDashboard(channel)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Dashboard Dialog */}
      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dashboard: {selectedChannel?.name}</DialogTitle>
          </DialogHeader>
          {selectedChannel && (
            <DashboardViewer 
              channel={selectedChannel}
              onUpdateChannel={onUpdateChannel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dashboard Details: {selectedChannel?.name}</DialogTitle>
          </DialogHeader>
          {selectedChannel && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">API Key</Label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyApiKey(selectedChannel.apiKey)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <code className="text-sm bg-background p-2 rounded border block">
                  {selectedChannel.apiKey}
                </code>
              </div>
              
              <div>
                <Label className="font-medium">Defined Fields</Label>
                <div className="mt-2 space-y-2">
                  {selectedChannel.fields.map((field, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="font-medium">{field.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Initial: {field.initialValue.toString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Fields Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Fields: {selectedChannel?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Fields Configuration</Label>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                <Plus className="h-3 w-3 mr-1" />
                Add Field
              </Button>
            </div>
            
            <div className="space-y-3">
              {editFields.map((field, index) => (
                <div key={index} className="flex items-end space-x-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-xs">Field Name</Label>
                    <Input
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                      placeholder="e.g., temperature, pressure"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="w-32">
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value) => updateField(index, { 
                        type: value as Field['type'],
                        initialValue: getDefaultValue(value)
                      })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="numeric">Numeric</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-24">
                    <Label className="text-xs">Initial Value</Label>
                    {field.type === 'boolean' ? (
                      <Select
                        value={field.initialValue.toString()}
                        onValueChange={(value) => updateField(index, { initialValue: value === 'true' })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={field.initialValue.toString()}
                        onChange={(e) => {
                          const value = field.type === 'numeric' ? 
                            parseFloat(e.target.value) || 0 : 
                            e.target.value;
                          updateField(index, { initialValue: value });
                        }}
                        type={field.type === 'numeric' ? 'number' : 'text'}
                        placeholder={field.type === 'numeric' ? '0' : 'value'}
                        className="mt-1"
                      />
                    )}
                  </div>
                  
                  {editFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeField(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEdit(false)}>
                Cancel
              </Button>
              <Button onClick={saveFieldChanges}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Widget Management Dialog */}
      <Dialog open={showWidgets} onOpenChange={setShowWidgets}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Widgets: {selectedChannel?.name}</DialogTitle>
          </DialogHeader>
          {selectedChannel && (
            <WidgetManager 
              channel={selectedChannel}
              onUpdateChannel={onUpdateChannel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete the dashboard <strong>{selectedChannel?.name}</strong>? 
              This action cannot be undone and will remove all associated data and widgets.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Dashboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardList;
