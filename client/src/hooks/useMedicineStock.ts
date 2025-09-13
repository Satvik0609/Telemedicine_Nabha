import { useState, useEffect, useCallback } from 'react';
import { medicineStockManager } from '@/lib/medicineStockManager';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

interface ReorderAlert {
  id: string;
  medicineId: string;
  medicineName: string;
  pharmacyId: string;
  currentStock: number;
  minimumStock: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: string;
  acknowledged: boolean;
  autoOrdered: boolean;
}

interface StockMovement {
  id: string;
  medicineId: string;
  pharmacyId: string;
  type: 'in' | 'out' | 'adjustment' | 'expired' | 'damaged';
  quantity: number;
  reason: string;
  timestamp: string;
  userId: string;
  userName: string;
}

export function useMedicineStock(pharmacyId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [stock, setStock] = useState<MedicineStock[]>([]);
  const [alerts, setAlerts] = useState<ReorderAlert[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Load initial data
    loadStockData();

    // Set up real-time updates
    const handleStockUpdate = (data: any) => {
      setStock(data.stock);
      setAlerts(data.alerts);
      setMovements(data.movements);
      setIsLoading(false);
    };

    medicineStockManager.addListener(handleStockUpdate);

    return () => {
      medicineStockManager.removeListener(handleStockUpdate);
    };
  }, []);

  const loadStockData = useCallback(() => {
    try {
      const allStock = medicineStockManager.getAllStock();
      const filteredStock = pharmacyId 
        ? allStock.filter(item => item.pharmacyId === pharmacyId)
        : allStock;
      
      setStock(filteredStock);
      setAlerts(medicineStockManager.getReorderAlerts());
      setMovements(medicineStockManager.getStockMovements());
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load stock data:', error);
      setIsLoading(false);
    }
  }, [pharmacyId]);

  const updateStock = useCallback(async (
    stockId: string,
    newQuantity: number,
    reason: string
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update stock",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updatedStock = await medicineStockManager.updateStock(
        stockId,
        newQuantity,
        reason,
        user.id,
        user.name
      );

      toast({
        title: "Stock Updated",
        description: `Stock updated to ${newQuantity} units`,
      });

      return updatedStock;
    } catch (error) {
      console.error('Failed to update stock:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update stock. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [user, toast]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`/api/reorder-alerts/${alertId}/acknowledge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledged: true })
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        toast({
          title: "Alert Acknowledged",
          description: "Reorder alert has been acknowledged",
        });
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive"
      });
    }
  }, [toast]);

  const createManualOrder = useCallback(async (
    medicineId: string,
    quantity: number,
    supplier: string,
    urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create orders",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/medicine-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId,
          pharmacyId: pharmacyId || 'default',
          quantity,
          supplier,
          urgency,
          autoOrdered: false,
          createdBy: user.id,
          createdByName: user.name
        })
      });

      if (response.ok) {
        toast({
          title: "Order Created",
          description: `Order for ${quantity} units has been created`,
        });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast({
        title: "Order Failed",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, pharmacyId, toast]);

  const getStockByStatus = useCallback((status: string) => {
    return stock.filter(item => item.status === status);
  }, [stock]);

  const getLowStockItems = useCallback(() => {
    return medicineStockManager.getLowStockItems();
  }, []);

  const getStockMovements = useCallback((medicineId?: string) => {
    return medicineStockManager.getStockMovements(medicineId, pharmacyId);
  }, [pharmacyId]);

  const getStockStatistics = useCallback(() => {
    const totalItems = stock.length;
    const availableItems = stock.filter(item => item.status === 'available').length;
    const limitedItems = stock.filter(item => item.status === 'limited').length;
    const outOfStockItems = stock.filter(item => item.status === 'out_of_stock').length;
    const reorderNeededItems = stock.filter(item => item.status === 'reorder_needed').length;
    
    const totalValue = stock.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
    const criticalAlerts = alerts.filter(alert => alert.urgency === 'critical').length;
    
    return {
      totalItems,
      availableItems,
      limitedItems,
      outOfStockItems,
      reorderNeededItems,
      totalValue,
      criticalAlerts,
      alertCount: alerts.length
    };
  }, [stock, alerts]);

  const searchStock = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return stock.filter(item => 
      item.medicineName.toLowerCase().includes(lowercaseQuery) ||
      item.supplier.toLowerCase().includes(lowercaseQuery) ||
      item.batchNumber?.toLowerCase().includes(lowercaseQuery)
    );
  }, [stock]);

  const getExpiringSoon = useCallback((days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return stock.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= cutoffDate && expiryDate > new Date();
    });
  }, [stock]);

  return {
    stock,
    alerts,
    movements,
    isLoading,
    isUpdating,
    updateStock,
    acknowledgeAlert,
    createManualOrder,
    getStockByStatus,
    getLowStockItems,
    getStockMovements,
    getStockStatistics,
    searchStock,
    getExpiringSoon,
    refresh: loadStockData
  };
}
