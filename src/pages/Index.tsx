import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { 
  Activity, 
  Database, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Check, 
  X,
  Monitor,
  BarChart3,
  Gauge,
  TrendingUp,
  Moon,
  Sun,
  Wifi,
  Server,
  Copy,
  Layers
} from 'lucide-react';
import DashboardForm from '@/components/DashboardForm';
import DashboardList from '@/components/DashboardList';
import WidgetManager from '@/components/WidgetManager';

const Index = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', username: '', password: '', confirmPassword: '' });

  // Mock data for demonstration - fixed type issues
  const [channels, setChannels] = useState([
    { 
      id: 1,
      name: 'Tank_001', 
      fields: [
        { name: 'temperature', type: 'numeric' as const, initialValue: 23.5 },
        { name: 'pressure', type: 'numeric' as const, initialValue: 1.2 },
        { name: 'level', type: 'numeric' as const, initialValue: 85.3 }
      ], 
      apiKey: 'key_tank001_xyz789',
      lastUpdate: '2024-06-12 14:30:22',
      widgets: [
        { 
          id: 1, 
          type: 'chart' as const, 
          config: { 
            chartType: 'line', 
            field: 'temperature', 
            title: 'Temperature Over Time',
            timeRange: '24h'
          }
        }
      ]
    },
    { 
      id: 2,
      name: 'Tank_002', 
      fields: [
        { name: 'temperature', type: 'numeric' as const, initialValue: 25.1 },
        { name: 'humidity', type: 'numeric' as const, initialValue: 62.8 },
        { name: 'ph', type: 'numeric' as const, initialValue: 7.2 }
      ], 
      apiKey: 'key_tank002_abc456',
      lastUpdate: '2024-06-12 14:29:45',
      widgets: []
    }
  ]);

  const [users, setUsers] = useState([
    { username: 'operator1', email: 'operator1@example.com', verified: true, approved: true, assignedDashboards: ['Tank_001'] },
    { username: 'technician2', email: 'tech2@example.com', verified: true, approved: false, assignedDashboards: [] },
    { username: 'supervisor3', email: 'super3@example.com', verified: false, approved: false, assignedDashboards: [] }
  ]);

  const [mockData, setMockData] = useState({
    Tank_001: { temperature: 23.5, pressure: 1.2, level: 85.3 },
    Tank_002: { temperature: 25.1, humidity: 62.8, ph: 7.2 }
  });

  // Theme toggle effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMockData(prev => ({
        Tank_001: {
          temperature: 20 + Math.random() * 10,
          pressure: 1 + Math.random() * 0.5,
          level: 80 + Math.random() * 20
        },
        Tank_002: {
          temperature: 22 + Math.random() * 8,
          humidity: 55 + Math.random() * 20,
          ph: 6.8 + Math.random() * 0.8
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.email === 'joemarian3010@gmail.com' && loginForm.password === 'admin') {
      setUser({ username: 'admin', email: 'joemarian3010@gmail.com', role: 'admin' });
      setCurrentView('admin-dashboard');
      toast({ title: "Welcome Admin!", description: "Successfully logged in." });
    } else if (loginForm.email && loginForm.password) {
      const foundUser = users.find(u => u.email === loginForm.email);
      if (foundUser && foundUser.verified && foundUser.approved) {
        setUser({ ...foundUser, role: 'user' });
        setCurrentView('user-dashboard');
        toast({ title: "Welcome!", description: "Successfully logged in." });
      } else {
        toast({ title: "Access Denied", description: "Account not verified or approved.", variant: "destructive" });
      }
    } else {
      toast({ title: "Invalid Credentials", description: "Please check your email and password.", variant: "destructive" });
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    
    const newUser = {
      username: registerForm.username,
      email: registerForm.email,
      verified: false,
      approved: false,
      assignedDashboards: []
    };
    
    setUsers(prev => [...prev, newUser]);
    toast({ 
      title: "Registration Successful", 
      description: "Please check your email for verification. Admin approval is also required." 
    });
    setCurrentView('login');
  };

  const logout = () => {
    setUser(null);
    setCurrentView('login');
    setLoginForm({ email: '', password: '' });
    toast({ title: "Logged Out", description: "See you next time!" });
  };

  const approveUser = (userEmail) => {
    setUsers(prev => prev.map(u => 
      u.email === userEmail ? { ...u, approved: true } : u
    ));
    toast({ title: "User Approved", description: "User can now access the system." });
  };

  const deleteUser = (userEmail) => {
    setUsers(prev => prev.filter(u => u.email !== userEmail));
    toast({ title: "User Deleted", description: "User has been removed from the system." });
  };

  const createChannel = (channelData) => {
    const newChannel = {
      id: Date.now(),
      name: channelData.name,
      fields: channelData.fields,
      apiKey: `key_${channelData.name.toLowerCase()}_${Math.random().toString(36).substr(2, 9)}`,
      lastUpdate: new Date().toLocaleString(),
      widgets: []
    };
    setChannels(prev => [...prev, newChannel]);
    toast({ title: "Dashboard Created", description: `${channelData.name} created successfully.` });
  };

  const updateChannel = (channelId, updatedData) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId ? { ...channel, ...updatedData } : channel
    ));
    toast({ title: "Dashboard Updated", description: "Changes saved successfully." });
  };

  const deleteChannel = (channelId) => {
    setChannels(prev => prev.filter(channel => channel.id !== channelId));
    toast({ title: "Dashboard Deleted", description: "Dashboard has been removed." });
  };

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-white hover:bg-white/10"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
        
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Server className="h-8 w-8 text-cyan-400 mr-2" />
              <CardTitle className="text-2xl font-bold text-white">IoT Monitor</CardTitle>
            </div>
            <p className="text-gray-300">Sign in to your account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700">
                Sign In
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Don't have an account?{' '}
                <button
                  onClick={() => setCurrentView('register')}
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Register Now
                </button>
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
              <p className="text-xs text-blue-200">
                <strong>Demo Admin:</strong> joemarian3010@gmail.com / admin
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Server className="h-8 w-8 text-cyan-400 mr-2" />
              <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
            </div>
            <p className="text-gray-300">Join the IoT monitoring platform</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="reg-email" className="text-white">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Choose a username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="reg-password" className="text-white">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Create a password"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700">
                Create Account
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Already have an account?{' '}
                <button
                  onClick={() => setCurrentView('login')}
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-amber-500/20 rounded-lg border border-amber-400/30">
              <p className="text-xs text-amber-200">
                Account requires email verification and admin approval.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === 'admin-dashboard') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <Server className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold">IoT Monitor - Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                className="data-[state=checked]:bg-primary"
              />
              <Badge variant="secondary">Administrator</Badge>
              <Button variant="ghost" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Manage Users</span>
              </TabsTrigger>
              <TabsTrigger value="dashboards" className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span>Dashboards</span>
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Database Viewer</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Dashboards</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.verified ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.approved ? "default" : "secondary"}>
                              {user.approved ? "Approved" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.assignedDashboards.length} assigned</Badge>
                          </TableCell>
                          <TableCell className="space-x-2">
                            {!user.approved && (
                              <Button
                                size="sm"
                                onClick={() => approveUser(user.email)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteUser(user.email)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboards" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Dashboard Management</h2>
                <DashboardForm onCreateChannel={createChannel} />
              </div>
              
              <DashboardList 
                channels={channels}
                onUpdateChannel={updateChannel}
                onDeleteChannel={deleteChannel}
              />
            </TabsContent>

            <TabsContent value="database" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Database Query Interface</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Channel</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {channels.map((channel, idx) => (
                            <SelectItem key={idx} value={channel.name}>
                              {channel.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Start Time</Label>
                      <Input type="datetime-local" />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input type="datetime-local" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button>
                      <Database className="h-4 w-4 mr-2" />
                      Fetch Data
                    </Button>
                    <Button variant="outline">
                      Export CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  if (currentView === 'user-dashboard') {
    const userDashboards = user?.assignedDashboards || [];
    
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <Server className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold">IoT Monitor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                className="data-[state=checked]:bg-primary"
              />
              <Badge variant="secondary">{user?.username}</Badge>
              <Button variant="ghost" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {userDashboards.length === 0 ? (
            <div className="text-center py-12">
              <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Dashboards Assigned</h2>
              <p className="text-muted-foreground">Please contact your administrator to assign dashboards to your account.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Your Dashboards</h2>
              
              {userDashboards.map((dashboardName) => {
                const channelData = channels.find(c => c.name === dashboardName);
                const liveData = mockData[dashboardName] || {};
                
                return (
                  <Card key={dashboardName} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-6 w-6 text-primary" />
                          <span>{dashboardName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-muted-foreground">Live</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {channelData?.fields.map((field) => (
                          <Card key={field.name} className="bg-muted/50">
                            <CardContent className="p-4 text-center">
                              <div className="flex items-center justify-center mb-2">
                                <Gauge className="h-5 w-5 text-primary mr-2" />
                                <h3 className="font-semibold capitalize">{field.name}</h3>
                              </div>
                              <div className="text-3xl font-bold text-primary">
                                {liveData[field.name]?.toFixed(1) || '--'}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {field.name === 'temperature' && '°C'}
                                {field.name === 'pressure' && 'bar'}
                                {field.name === 'level' && '%'}
                                {field.name === 'humidity' && '%'}
                                {field.name === 'ph' && 'pH'}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold mb-4 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Statistics (Last 24h)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-muted-foreground">Average</p>
                            <p className="font-semibold">
                              {channelData?.fields.map(field => 
                                `${field.name}: ${(liveData[field.name] || 0).toFixed(1)}`
                              ).join(' | ')}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground">Min</p>
                            <p className="font-semibold text-blue-600">
                              {channelData?.fields.map(field => 
                                `${field.name}: ${((liveData[field.name] || 0) * 0.8).toFixed(1)}`
                              ).join(' | ')}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground">Max</p>
                            <p className="font-semibold text-red-600">
                              {channelData?.fields.map(field => 
                                `${field.name}: ${((liveData[field.name] || 0) * 1.2).toFixed(1)}`
                              ).join(' | ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
