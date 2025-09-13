import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMedicines, useMedicineStock } from '@/hooks/useAppointments';

interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  manufacturer?: string;
  price: number;
}

interface MedicineStock {
  id: string;
  quantity: number;
  status: 'available' | 'limited' | 'out_of_stock';
  pharmacy: {
    id: string;
    name: string;
    address: string;
    phone?: string;
  };
}

export function MedicineTracker() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const { data: allMedicines = [], isLoading: searchLoading } = useMedicines();
  const { data: allMedicineStock = [], isLoading: stockLoading } = useMedicineStock();

  // Filter medicines based on search query
  const medicines = searchQuery.length > 2 
    ? allMedicines.filter((medicine: Medicine) => 
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.genericName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Filter stock for selected medicine
  const medicineStock = selectedMedicine 
    ? allMedicineStock.filter((stock: any) => stock.medicineId === selectedMedicine.id)
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return 'fas fa-check-circle';
      case 'limited':
        return 'fas fa-exclamation-triangle';
      case 'out_of_stock':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-question-circle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return t('available');
      case 'limited':
        return t('limited-stock');
      case 'out_of_stock':
        return t('out-of-stock');
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-pills mr-2 text-primary"></i>
            {t('medicine-availability')} - Live Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search medicine (e.g., Paracetamol, Amoxicillin)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-medicine-search"
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedMedicine(null);
              }}
              data-testid="button-clear-search"
            >
              Clear
            </Button>
          </div>

          {searchLoading && (
            <div className="text-center py-4">
              <i className="fas fa-spinner fa-spin text-primary mr-2"></i>
              Searching medicines...
            </div>
          )}

          {medicines && medicines.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Search Results:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {medicines.map((medicine: Medicine) => (
                  <div
                    key={medicine.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                      selectedMedicine?.id === medicine.id ? 'bg-accent border-primary' : ''
                    }`}
                    onClick={() => setSelectedMedicine(medicine)}
                    data-testid={`medicine-item-${medicine.id}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium">{medicine.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {medicine.dosage}
                          {medicine.genericName && ` • ${medicine.genericName}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{medicine.price}</p>
                        {medicine.manufacturer && (
                          <p className="text-xs text-muted-foreground">{medicine.manufacturer}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchQuery.length > 2 && medicines && medicines.length === 0 && !searchLoading && (
            <div className="text-center py-4 text-muted-foreground">
              <i className="fas fa-search text-2xl mb-2"></i>
              <p>No medicines found for "{searchQuery}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMedicine && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <span>{selectedMedicine.name}</span>
                <p className="text-sm font-normal text-muted-foreground">
                  Availability in nearby pharmacies
                </p>
              </div>
              <Badge variant="outline">
                <i className="fas fa-sync-alt mr-1"></i>
                Live Data
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stockLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : medicineStock && medicineStock.length > 0 ? (
              <div className="space-y-3">
                {medicineStock.map((stock: MedicineStock) => (
                  <div
                    key={stock.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`stock-item-${stock.id}`}
                  >
                    <div className="flex-1">
                      <h5 className="font-medium">{stock.pharmacy.name}</h5>
                      <p className="text-sm text-muted-foreground">{stock.pharmacy.address}</p>
                      {stock.pharmacy.phone && (
                        <p className="text-sm text-muted-foreground">
                          <i className="fas fa-phone mr-1"></i>
                          {stock.pharmacy.phone}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right space-y-1">
                      <Badge className={getStatusColor(stock.status)}>
                        <i className={`${getStatusIcon(stock.status)} mr-1`}></i>
                        {getStatusText(stock.status)}
                      </Badge>
                      
                      {stock.status !== 'out_of_stock' && (
                        <div className="text-sm">
                          <span className="font-medium">₹{selectedMedicine.price}</span>
                          {stock.quantity > 0 && (
                            <span className="text-muted-foreground ml-2">
                              ({stock.quantity} in stock)
                            </span>
                          )}
                        </div>
                      )}
                      
                      {stock.pharmacy.phone && stock.status !== 'out_of_stock' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${stock.pharmacy.phone}`, '_self')}
                          data-testid={`button-call-${stock.id}`}
                        >
                          <i className="fas fa-phone mr-1"></i>
                          Call
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-store-slash text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-medium mb-2">No Stock Information</h3>
                <p className="text-muted-foreground">
                  Stock information for this medicine is not available in nearby pharmacies.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
