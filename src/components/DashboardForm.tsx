
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Field {
  name: string;
  type: 'numeric' | 'text' | 'boolean';
  initialValue: string | number | boolean;
}

interface User {
  username: string;
  email: string;
  verified: boolean;
  approved: boolean;
  assignedDashboards: string[];
}

interface DashboardFormProps {
  onCreateChannel: (channelData: any) => void;
  users: User[];
}

const DashboardForm: React.FC<DashboardFormProps> = ({ onCreateChannel, users }) => {
  const [open, setOpen] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [fields, setFields] = useState<Field[]>([
    { name: 'temperature', type: 'numeric', initialValue: 0 }
  ]);
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);

  const addField = () => {
    setFields([...fields, { name: '', type: 'numeric', initialValue: 0 }]);
  };

  const updateField = (index: number, field: Partial<Field>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...field };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const getDefaultValue = (type: string) => {
    switch (type) {
      case 'numeric': return 0;
      case 'boolean': return false;
      default: return '';
    }
  };

  const handleUserAssignment = (userEmail: string, checked: boolean) => {
    if (checked) {
      setAssignedUsers([...assignedUsers, userEmail]);
    } else {
      setAssignedUsers(assignedUsers.filter(email => email !== userEmail));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelName.trim()) {
      toast({ title: "Error", description: "Channel name is required.", variant: "destructive" });
      return;
    }

    const validFields = fields.filter(field => field.name.trim() !== '');
    if (validFields.length === 0) {
      toast({ title: "Error", description: "At least one field is required.", variant: "destructive" });
      return;
    }

    onCreateChannel({
      name: channelName,
      fields: validFields,
      assignedUsers
    });

    // Reset form
    setChannelName('');
    setFields([{ name: 'temperature', type: 'numeric', initialValue: 0 }]);
    setAssignedUsers([]);
    setOpen(false);
  };

  // Get approved users only
  const approvedUsers = users.filter(user => user.approved && user.verified);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Dashboard</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="channelName">Dashboard Name</Label>
            <Input
              id="channelName"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="e.g., Tank_001, Sensor_Hub"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Fields Configuration</Label>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                <Plus className="h-3 w-3 mr-1" />
                Add Field
              </Button>
            </div>
            
            <div className="space-y-3">
              {fields.map((field, index) => (
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
                  
                  {fields.length > 1 && (
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
          </div>

          <div>
            <Label className="text-base font-medium">Assign Users</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select which users can access this dashboard
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {approvedUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No approved users available
                </p>
              ) : (
                approvedUsers.map((user) => (
                  <div key={user.email} className="flex items-center space-x-2">
                    <Checkbox
                      id={user.email}
                      checked={assignedUsers.includes(user.email)}
                      onCheckedChange={(checked) => handleUserAssignment(user.email, checked as boolean)}
                    />
                    <Label htmlFor={user.email} className="flex-1 cursor-pointer">
                      <span className="font-medium">{user.username}</span>
                      <span className="text-sm text-muted-foreground ml-2">({user.email})</span>
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Dashboard
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardForm;
