import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  BarChart3,
  Download,
  Settings,
  Shield,
  Calendar,
  Pill,
  Stethoscope
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'pharmacist' | 'admin';
  createdAt: string;
  isActive: boolean;
}

interface AnalyticsData {
  totalUsers: number;
  activeDoctors: number;
  totalAppointments: number;
  completedConsultations: number;
  medicineShortages: number;
  revenue: number;
  diseasePatterns: Array<{
    condition: string;
    count: number;
    trend: 'up' | 'down';
  }>;
  medicineUsage: Array<{
    medicine: string;
    usage: number;
    trend: 'up' | 'down';
  }>;
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mock data for demonstration
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91 98765 43210',
      role: 'patient',
      createdAt: '2024-01-15T10:30:00Z',
      isActive: true
    },
    {
      id: '2',
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@hospital.com',
      phone: '+91 87654 32109',
      role: 'doctor',
      createdAt: '2024-01-10T09:15:00Z',
      isActive: true
    },
    {
      id: '3',
      name: 'Amit Singh',
      email: 'amit.singh@pharmacy.com',
      phone: '+91 76543 21098',
      role: 'pharmacist',
      createdAt: '2024-01-12T14:20:00Z',
      isActive: true
    },
    {
      id: '4',
      name: 'Sunita Devi',
      email: 'sunita@example.com',
      phone: '+91 65432 10987',
      role: 'patient',
      createdAt: '2024-01-20T16:45:00Z',
      isActive: false
    }
  ];

  const mockAnalytics: AnalyticsData = {
    totalUsers: 1247,
    activeDoctors: 23,
    totalAppointments: 456,
    completedConsultations: 389,
    medicineShortages: 12,
    revenue: 125000,
    diseasePatterns: [
      { condition: 'Diabetes', count: 45, trend: 'up' },
      { condition: 'Hypertension', count: 38, trend: 'up' },
      { condition: 'Common Cold', count: 67, trend: 'down' },
      { condition: 'Fever', count: 23, trend: 'down' }
    ],
    medicineUsage: [
      { medicine: 'Paracetamol', usage: 234, trend: 'up' },
      { medicine: 'Amoxicillin', usage: 156, trend: 'down' },
      { medicine: 'Insulin', usage: 89, trend: 'up' },
      { medicine: 'Metformin', usage: 123, trend: 'up' }
    ]
  };

  const mockAuditLogs: AuditLog[] = [
    {
      id: '1',
      userId: '2',
      userName: 'Dr. Priya Sharma',
      action: 'LOGIN',
      resource: 'System',
      details: 'Logged into doctor dashboard',
      timestamp: '2024-01-25T10:30:00Z',
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      userId: '3',
      userName: 'Amit Singh',
      action: 'UPDATE',
      resource: 'Medicine Stock',
      details: 'Updated Paracetamol stock to 150 units',
      timestamp: '2024-01-25T09:15:00Z',
      ipAddress: '192.168.1.101'
    },
    {
      id: '3',
      userId: '1',
      userName: 'Rajesh Kumar',
      action: 'CREATE',
      resource: 'Appointment',
      details: 'Booked appointment with Dr. Priya Sharma',
      timestamp: '2024-01-25T08:45:00Z',
      ipAddress: '192.168.1.102'
    }
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patient': return 'bg-blue-100 text-blue-800';
      case 'doctor': return 'bg-green-100 text-green-800';
      case 'pharmacist': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUserStatusToggle = (userId: string, currentStatus: boolean) => {
    toast({
      title: "User Status Updated",
      description: `User ${currentStatus ? 'deactivated' : 'activated'} successfully`,
    });
  };

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `${reportType} report has been generated and downloaded`,
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.name}! Monitor and manage the healthcare platform.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.totalUsers}</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.activeDoctors}</p>
                <p className="text-xs text-green-600">+3 this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.totalAppointments}</p>
                <p className="text-xs text-blue-600">+8% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medicine Shortages</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.medicineShortages}</p>
                <p className="text-xs text-red-600">Requires attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>User Management</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="patient">Patients</SelectItem>
                    <SelectItem value="doctor">Doctors</SelectItem>
                    <SelectItem value="pharmacist">Pharmacists</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role.toUpperCase()}
                          </Badge>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{user.email}</p>
                        <p className="text-gray-500 text-sm">{user.phone}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Joined: {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUserStatusToggle(user.id, user.isActive)}
                        >
                          {user.isActive ? <UserX className="h-4 w-4 mr-1" /> : <UserCheck className="h-4 w-4 mr-1" />}
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Disease Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.diseasePatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{pattern.condition}</span>
                        {pattern.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <span className="font-bold">{pattern.count} cases</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medicine Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.medicineUsage.map((medicine, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{medicine.medicine}</span>
                        {medicine.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <span className="font-bold">{medicine.usage} units</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{mockAnalytics.completedConsultations}</p>
                  <p className="text-sm text-gray-600">Completed Consultations</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">₹{mockAnalytics.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">99.8%</p>
                  <p className="text-sm text-gray-600">System Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAuditLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{log.action}</Badge>
                          <span className="text-sm text-gray-500">{log.resource}</span>
                        </div>
                        <p className="font-medium">{log.userName}</p>
                        <p className="text-gray-600 text-sm">{log.details}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                          <span>IP: {log.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Government Health Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Monthly Health Statistics</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Generate comprehensive monthly health statistics report for government submission
                  </p>
                  <Button 
                    onClick={() => handleGenerateReport('Monthly Health Statistics')}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Disease Surveillance Report</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Track disease patterns and outbreaks in the region
                  </p>
                  <Button 
                    onClick={() => handleGenerateReport('Disease Surveillance')}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Medicine Availability Report</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Monitor medicine stock levels and shortages across pharmacies
                  </p>
                  <Button 
                    onClick={() => handleGenerateReport('Medicine Availability')}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Telemedicine Usage Report</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Analyze telemedicine adoption and usage patterns
                  </p>
                  <Button 
                    onClick={() => handleGenerateReport('Telemedicine Usage')}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <Select defaultValue="disabled">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="enabled">Enabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
                <div>
                  <Label htmlFor="password-policy">Password Policy</Label>
                  <Select defaultValue="strong">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                      <SelectItem value="very-strong">Very Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Update Security</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
