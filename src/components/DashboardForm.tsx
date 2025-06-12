
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Plus, X, Copy, Key } from 'lucide-react';

interface Field {
  name: string;
  type: 'numeric' | 'text' | 'boolean';
  initialValue: string | number | boolean;
}

interface DashboardFormProps {
  onCreateChannel: (data: { name: string; fields: Field[] }) => void;
}

const DashboardForm: React.FC<DashboardFormProps> = ({ onCreateChannel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [fields, setFields] = useState<Field[]>([
    { name: '', type: 'numeric', initialValue: 0 }
  ]);
  const [showApiKey, setShowApiKey] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState('');

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

    // Simulate API key generation
    const apiKey = `key_${channelName.toLowerCase()}_${Math.random().toString(36).substr(2, 12)}`;
    setGeneratedApiKey(apiKey);

    onCreateChannel({
      name: channelName,
      fields: validFields
    });

    setShowApiKey(true);
    
    // Reset form after showing API key
    setTimeout(() => {
      setChannelName('');
      setFields([{ name: '', type: 'numeric', initialValue: 0 }]);
      setShowApiKey(false);
      setGeneratedApiKey('');
      setIsOpen(false);
    }, 5000);
  };

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

  const copyApiKey = () => {
    navigator.clipboard.writeText(generatedApiKey);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Dashboard</DialogTitle>
        </DialogHeader>
        
        {showApiKey ? (
          <div className="space-y-4">
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2 mb-4">
                <Key className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">Dashboard Created Successfully!</h3>
              </div>
              
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                Your dashboard <strong>{channelName}</strong> has been created. Here's your API key:
              </p>
              
              <div className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 rounded border">
                <code className="flex-1 text-sm font-mono">{generatedApiKey}</code>
                <Button size="sm" variant="outline" onClick={copyApiKey}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                ⚠️ Please save this API key securely. You won't be able to see it again.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="channel-name">Dashboard Name</Label>
              <Input
                id="channel-name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g., Tank_003, Sensor_Hub_01"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Data Fields</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addField}
                >
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
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Dashboard</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DashboardForm;
