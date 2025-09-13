import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMedicineStock } from '@/hooks/useMedicineStock';
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
  Package, 
  Search, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  QrCode,
  FileText,
  TrendingUp
} from 'lucide-react';

interface MedicineStock {
  id: string;
  medicineId: string;
  medicineName: string;
  pharmacyId: string;
  pharmacyName: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unitPrice: number;
  lastUpdated: string;
  status: 'available' | 'limited' | 'out_of_stock' | 'reorder_needed';
  supplier: string;
  expiryDate?: string;
  batchNumber?: string;
}

interface Prescription {
  id: string;
  patient: {
    id: string;
    name: string;
    phone: string;
  };
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
  medicines: Array<{
    medicineId: string;
    medicineName: string;
    dosage: string;
    quantity: number;
    instructions: string;
  }>;
  status: 'pending' | 'processing' | 'ready' | 'dispensed' | 'cancelled';
  createdAt: string;
}

export default function PharmacistDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use real-time stock management
  const {
    stock: realTimeStock,
    alerts,
    movements,
    isLoading: stockLoading,
    isUpdating,
    updateStock,
    acknowledgeAlert,
    createManualOrder,
    getStockStatistics,
    getLowStockItems,
    searchStock,
    getExpiringSoon
  } = useMedicineStock('pharmacy-1'); // Assuming pharmacy-1 for demo
  
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineStock | null>(null);
  const [stockUpdateQuantity, setStockUpdateQuantity] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [qrScannerOpen, setQrScannerOpen] = useState<boolean>(false);

  // Mock data for demonstration
  const mockStock: MedicineStock[] = [
    {
      id: '1',
      medicineId: 'med1',
      medicineName: 'Paracetamol 500mg',
      pharmacyId: 'pharmacy-1',
      pharmacyName: 'Nabha Medical Store',
      currentStock: 150,
      minimumStock: 50,
      maximumStock: 500,
      unitPrice: 25,
      lastUpdated: new Date().toISOString(),
      status: 'available',
      supplier: 'Sun Pharma',
      batchNumber: 'SP2024001'
    },
    {
      id: '2',
      medicineId: 'med2',
      medicineName: 'Amoxicillin 250mg',
      pharmacyId: 'pharmacy-1',
      pharmacyName: 'Nabha Medical Store',
      currentStock: 5,
      minimumStock: 20,
      maximumStock: 200,
      unitPrice: 45,
      lastUpdated: new Date().toISOString(),
      status: 'limited',
      supplier: 'Cipla',
      batchNumber: 'CP2024002'
    },
    {
      id: '3',
      medicineId: 'med3',
      medicineName: 'Insulin Glargine',
      pharmacyId: 'pharmacy-1',
      pharmacyName: 'Nabha Medical Store',
      currentStock: 0,
      minimumStock: 10,
      maximumStock: 100,
      unitPrice: 850,
      lastUpdated: new Date().toISOString(),
      status: 'out_of_stock',
      supplier: 'Novo Nordisk',
      batchNumber: 'NN2024003'
    }
  ];

  const mockPrescriptions: Prescription[] = [
    {
      id: 'pres1',
      patient: {
        id: 'patient1',
        name: 'Rajesh Kumar',
        phone: '+91 98765 43210'
      },
      doctor: {
        id: 'doc1',
        name: 'Dr. Priya Sharma',
        specialty: 'General Medicine'
      },
      medicines: [
        {
          medicineId: 'med1',
          medicineName: 'Paracetamol 500mg',
          dosage: '500mg',
          quantity: 10,
          instructions: 'Take 1 tablet twice daily after meals'
        }
      ],
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: 'pres2',
      patient: {
        id: 'patient2',
        name: 'Sunita Devi',
        phone: '+91 87654 32109'
      },
      doctor: {
        id: 'doc2',
        name: 'Dr. Amit Singh',
        specialty: 'Cardiology'
      },
      medicines: [
        {
          medicineId: 'med2',
          medicineName: 'Amoxicillin 250mg',
          dosage: '250mg',
          quantity: 14,
          instructions: 'Take 1 capsule three times daily'
        }
      ],
      status: 'processing',
      createdAt: new Date().toISOString()
    }
  ];

  // Use real-time stock data instead of mock data
  const stockData = realTimeStock.length > 0 ? realTimeStock : mockStock;
  const filteredStock = searchQuery 
    ? searchStock(searchQuery)
    : stockData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrescriptionStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'dispensed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStockUpdate = async (medicineId: string, newQuantity: number) => {
    try {
      await updateStock(medicineId, newQuantity, 'Manual stock update');
      setSelectedMedicine(null);
      setStockUpdateQuantity(0);
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  const handlePrescriptionStatusUpdate = (prescriptionId: string, newStatus: string) => {
    // In a real app, this would make an API call
    toast({
      title: "Prescription Updated",
      description: `Prescription status updated to ${newStatus}`,
    });
  };

  const stockStats = getStockStatistics();
  const lowStockMedicines = getLowStockItems();
  const expiringSoon = getExpiringSoon(30);
  const pendingPrescriptions = mockPrescriptions.filter(pres => pres.status === 'pending');

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pharmacist Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.name}! Manage your pharmacy operations efficiently.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                <p className="text-2xl font-bold text-gray-900">{stockStats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stockStats.reorderNeededItems + stockStats.outOfStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPrescriptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                <p className="text-2xl font-bold text-gray-900">₹12,450</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock">Medicine Stock</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Medicine Stock Tab */}
        <TabsContent value="stock" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Medicine Stock Management</CardTitle>
                <div className="flex gap-2">
                  <Dialog open={qrScannerOpen} onOpenChange={setQrScannerOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <QrCode className="h-4 w-4 mr-2" />
                        Scan QR Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>QR Code Scanner</DialogTitle>
                      </DialogHeader>
                      <div className="p-8 text-center">
                        <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">QR Scanner functionality would be implemented here</p>
                        <p className="text-sm text-gray-500 mt-2">
                          This would integrate with device camera to scan medicine QR codes
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medicine
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredStock.map((medicine) => (
                  <div key={medicine.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{medicine.medicineName}</h3>
                        <p className="text-gray-600">{medicine.supplier}</p>
                        <p className="text-sm text-gray-500">
                          {medicine.batchNumber} • {medicine.supplier}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-lg font-bold">₹{medicine.unitPrice}</span>
                          <Badge className={getStatusColor(medicine.status)}>
                            {medicine.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Stock: {medicine.currentStock} units
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedMedicine(medicine)}
                            >
                              Update Stock
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Stock - {medicine.medicineName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="quantity">Current Stock: {medicine.currentStock}</Label>
                                <Input
                                  id="quantity"
                                  type="number"
                                  placeholder="Enter new quantity"
                                  value={stockUpdateQuantity}
                                  onChange={(e) => setStockUpdateQuantity(Number(e.target.value))}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleStockUpdate(medicine.id, stockUpdateQuantity)}
                                  disabled={stockUpdateQuantity < 0}
                                >
                                  Update Stock
                                </Button>
                                <Button variant="outline" onClick={() => setStockUpdateQuantity(0)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">Prescription #{prescription.id.slice(-6)}</h3>
                          <Badge className={getPrescriptionStatusColor(prescription.status)}>
                            {prescription.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Patient</p>
                            <p className="font-medium">{prescription.patient.name}</p>
                            <p className="text-sm text-gray-500">{prescription.patient.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Doctor</p>
                            <p className="font-medium">{prescription.doctor.name}</p>
                            <p className="text-sm text-gray-500">{prescription.doctor.specialty}</p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-2">Medicines:</p>
                          <div className="space-y-1">
                            {prescription.medicines.map((medicine, index) => (
                              <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                                <span className="font-medium">{medicine.medicineName}</span>
                                <span className="text-gray-600"> - {medicine.dosage} x {medicine.quantity}</span>
                                <p className="text-xs text-gray-500 mt-1">{medicine.instructions}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-gray-500">
                          Created: {format(new Date(prescription.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {prescription.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handlePrescriptionStatusUpdate(prescription.id, 'processing')}
                            >
                              Start Processing
                            </Button>
                          </>
                        )}
                        {prescription.status === 'processing' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePrescriptionStatusUpdate(prescription.id, 'ready')}
                            >
                              Mark Ready
                            </Button>
                          </>
                        )}
                        {prescription.status === 'ready' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handlePrescriptionStatusUpdate(prescription.id, 'dispensed')}
                            >
                              Mark Dispensed
                            </Button>
                          </>
                        )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <div key={alert.id} className={`p-3 rounded-lg ${
                        alert.urgency === 'critical' ? 'bg-red-50 border border-red-200' :
                        alert.urgency === 'high' ? 'bg-orange-50 border border-orange-200' :
                        alert.urgency === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-blue-50 border border-blue-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{alert.medicineName}</p>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                            <p className="text-xs text-gray-500">
                              {alert.currentStock} / {alert.minimumStock} units
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => createManualOrder(alert.medicineId, alert.minimumStock * 2, 'Default Supplier', alert.urgency)}
                            >
                              Reorder
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No active alerts</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Prescription #123456 dispensed</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Stock updated for Paracetamol</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">New prescription received</p>
                      <p className="text-xs text-gray-500">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
