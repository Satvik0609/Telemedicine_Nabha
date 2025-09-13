import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Pill, 
  Activity,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

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
    percentage: number;
  }>;
  medicineUsage: Array<{
    medicine: string;
    usage: number;
    trend: 'up' | 'down';
    percentage: number;
  }>;
  appointmentTrends: Array<{
    date: string;
    appointments: number;
    consultations: number;
  }>;
  userGrowth: Array<{
    month: string;
    patients: number;
    doctors: number;
    pharmacists: number;
  }>;
  regionalData: Array<{
    region: string;
    patients: number;
    consultations: number;
    revenue: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Mock analytics data
  const mockAnalytics: AnalyticsData = {
    totalUsers: 1247,
    activeDoctors: 23,
    totalAppointments: 456,
    completedConsultations: 389,
    medicineShortages: 12,
    revenue: 125000,
    diseasePatterns: [
      { condition: 'Diabetes', count: 45, trend: 'up', percentage: 18 },
      { condition: 'Hypertension', count: 38, trend: 'up', percentage: 15 },
      { condition: 'Common Cold', count: 67, trend: 'down', percentage: 26 },
      { condition: 'Fever', count: 23, trend: 'down', percentage: 9 },
      { condition: 'Respiratory Issues', count: 34, trend: 'up', percentage: 13 },
      { condition: 'Digestive Problems', count: 28, trend: 'down', percentage: 11 },
      { condition: 'Skin Conditions', count: 19, trend: 'up', percentage: 7 }
    ],
    medicineUsage: [
      { medicine: 'Paracetamol', usage: 234, trend: 'up', percentage: 25 },
      { medicine: 'Amoxicillin', usage: 156, trend: 'down', percentage: 17 },
      { medicine: 'Insulin', usage: 89, trend: 'up', percentage: 10 },
      { medicine: 'Metformin', usage: 123, trend: 'up', percentage: 13 },
      { medicine: 'Omeprazole', usage: 78, trend: 'down', percentage: 8 },
      { medicine: 'Cetirizine', usage: 95, trend: 'up', percentage: 10 },
      { medicine: 'Aspirin', usage: 67, trend: 'down', percentage: 7 },
      { medicine: 'Other', usage: 98, trend: 'up', percentage: 10 }
    ],
    appointmentTrends: [
      { date: '2024-01-01', appointments: 12, consultations: 10 },
      { date: '2024-01-02', appointments: 15, consultations: 12 },
      { date: '2024-01-03', appointments: 18, consultations: 15 },
      { date: '2024-01-04', appointments: 14, consultations: 11 },
      { date: '2024-01-05', appointments: 20, consultations: 16 },
      { date: '2024-01-06', appointments: 16, consultations: 13 },
      { date: '2024-01-07', appointments: 22, consultations: 18 }
    ],
    userGrowth: [
      { month: 'Jan', patients: 120, doctors: 5, pharmacists: 2 },
      { month: 'Feb', patients: 145, doctors: 6, pharmacists: 3 },
      { month: 'Mar', patients: 168, doctors: 7, pharmacists: 3 },
      { month: 'Apr', patients: 192, doctors: 8, pharmacists: 4 },
      { month: 'May', patients: 215, doctors: 9, pharmacists: 4 },
      { month: 'Jun', patients: 238, doctors: 10, pharmacists: 5 }
    ],
    regionalData: [
      { region: 'Nabha', patients: 456, consultations: 234, revenue: 45000 },
      { region: 'Patiala', patients: 234, consultations: 123, revenue: 23000 },
      { region: 'Rajpura', patients: 189, consultations: 98, revenue: 19000 },
      { region: 'Sangrur', patients: 156, consultations: 78, revenue: 15000 },
      { region: 'Other', patients: 212, consultations: 108, revenue: 23000 }
    ]
  };

  const { data: analytics = mockAnalytics, isLoading } = useQuery({
    queryKey: ['analytics', timeRange, selectedRegion],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      return mockAnalytics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleExportReport = (reportType: string) => {
    // In a real app, this would generate and download a report
    console.log(`Exporting ${reportType} report`);
  };

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive healthcare analytics and insights</p>
        </div>
        
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalAppointments}</p>
                <p className="text-xs text-green-600">+8% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Consultations</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.completedConsultations}</p>
                <p className="text-xs text-blue-600">85% completion rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Pill className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medicine Shortages</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.medicineShortages}</p>
                <p className="text-xs text-red-600">Requires attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="diseases" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="diseases">Disease Patterns</TabsTrigger>
          <TabsTrigger value="medicines">Medicine Usage</TabsTrigger>
          <TabsTrigger value="trends">Appointment Trends</TabsTrigger>
          <TabsTrigger value="regional">Regional Data</TabsTrigger>
        </TabsList>

        {/* Disease Patterns Tab */}
        <TabsContent value="diseases" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Disease Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.diseasePatterns}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ condition, percentage }) => `${condition} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.diseasePatterns.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disease Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.diseasePatterns.map((disease, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{disease.condition}</span>
                        {getTrendIcon(disease.trend)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{disease.count} cases</span>
                        <Badge variant="outline">{disease.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medicine Usage Tab */}
        <TabsContent value="medicines" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Medicine Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.medicineUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="medicine" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Medicines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.medicineUsage.slice(0, 5).map((medicine, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{medicine.medicine}</span>
                        {getTrendIcon(medicine.trend)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{medicine.usage} units</span>
                        <Badge variant="outline">{medicine.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appointment Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.appointmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="appointments" stroke="#8884d8" />
                    <Line type="monotone" dataKey="consultations" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="patients" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="doctors" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="pharmacists" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Regional Data Tab */}
        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.regionalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="patients" fill="#8884d8" />
                  <Bar yAxisId="left" dataKey="consultations" fill="#82ca9d" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ff7300" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Government Reports Section */}
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
                onClick={() => handleExportReport('Monthly Health Statistics')}
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
                onClick={() => handleExportReport('Disease Surveillance')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
