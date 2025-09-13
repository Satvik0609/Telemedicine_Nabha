import { offlineStorage } from './offlineStorage';

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

class MedicineStockManager {
  private stockData: Map<string, MedicineStock> = new Map();
  private reorderAlerts: ReorderAlert[] = [];
  private stockMovements: StockMovement[] = [];
  private listeners: Set<(data: any) => void> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeStockData();
    this.startRealTimeSync();
  }

  private async initializeStockData(): Promise<void> {
    try {
      // Load initial stock data from API or offline storage
      const response = await fetch('/api/medicine-stock/all');
      if (response.ok) {
        const stockData = await response.json();
        stockData.forEach((stock: MedicineStock) => {
          this.stockData.set(stock.id, stock);
        });
      } else {
        // Fallback to offline data
        console.warn('Failed to load stock data from API, using offline data');
        await this.loadOfflineStockData();
      }
      
      this.checkReorderAlerts();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to initialize stock data:', error);
      await this.loadOfflineStockData();
    }
  }

  private async loadOfflineStockData(): Promise<void> {
    // In a real implementation, this would load from IndexedDB or SQLite
    const mockStockData: MedicineStock[] = [
      {
        id: 'stock-1',
        medicineId: 'med-1',
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
        expiryDate: '2025-12-31',
        batchNumber: 'SP2024001'
      },
      {
        id: 'stock-2',
        medicineId: 'med-2',
        medicineName: 'Amoxicillin 250mg',
        pharmacyId: 'pharmacy-1',
        pharmacyName: 'Nabha Medical Store',
        currentStock: 5,
        minimumStock: 20,
        maximumStock: 200,
        unitPrice: 45,
        lastUpdated: new Date().toISOString(),
        status: 'reorder_needed',
        supplier: 'Cipla',
        expiryDate: '2025-06-30',
        batchNumber: 'CP2024002'
      },
      {
        id: 'stock-3',
        medicineId: 'med-3',
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
        expiryDate: '2025-03-15',
        batchNumber: 'NN2024003'
      }
    ];

    mockStockData.forEach(stock => {
      this.stockData.set(stock.id, stock);
    });
  }

  private startRealTimeSync(): void {
    // Sync with server every 30 seconds
    this.syncInterval = setInterval(async () => {
      await this.syncWithServer();
    }, 30000);
  }

  private async syncWithServer(): Promise<void> {
    try {
      const response = await fetch('/api/medicine-stock/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastSync: localStorage.getItem('lastStockSync') || new Date(0).toISOString(),
          localChanges: this.getLocalChanges()
        })
      });

      if (response.ok) {
        const { updates, conflicts } = await response.json();
        
        // Apply server updates
        updates.forEach((update: MedicineStock) => {
          this.stockData.set(update.id, update);
        });

        // Handle conflicts
        if (conflicts.length > 0) {
          console.warn('Stock conflicts detected:', conflicts);
          this.handleConflicts(conflicts);
        }

        localStorage.setItem('lastStockSync', new Date().toISOString());
        this.checkReorderAlerts();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to sync with server:', error);
    }
  }

  private getLocalChanges(): any[] {
    // Return local changes that need to be synced
    return Array.from(this.stockData.values()).filter(stock => 
      new Date(stock.lastUpdated) > new Date(localStorage.getItem('lastStockSync') || 0)
    );
  }

  private handleConflicts(conflicts: any[]): void {
    // In a real implementation, this would handle conflicts intelligently
    conflicts.forEach(conflict => {
      console.log('Resolving conflict for:', conflict.medicineId);
      // For now, just use server version
      this.stockData.set(conflict.id, conflict.serverVersion);
    });
  }

  // Public API methods
  async updateStock(
    stockId: string, 
    newQuantity: number, 
    reason: string, 
    userId: string,
    userName: string
  ): Promise<MedicineStock> {
    const stock = this.stockData.get(stockId);
    if (!stock) {
      throw new Error('Stock not found');
    }

    const oldQuantity = stock.currentStock;
    stock.currentStock = newQuantity;
    stock.lastUpdated = new Date().toISOString();
    
    // Update status based on stock level
    if (newQuantity === 0) {
      stock.status = 'out_of_stock';
    } else if (newQuantity <= stock.minimumStock) {
      stock.status = 'reorder_needed';
    } else if (newQuantity <= stock.minimumStock * 1.5) {
      stock.status = 'limited';
    } else {
      stock.status = 'available';
    }

    // Record stock movement
    const movement: StockMovement = {
      id: `movement-${Date.now()}`,
      medicineId: stock.medicineId,
      pharmacyId: stock.pharmacyId,
      type: newQuantity > oldQuantity ? 'in' : 'out',
      quantity: Math.abs(newQuantity - oldQuantity),
      reason,
      timestamp: new Date().toISOString(),
      userId,
      userName
    };

    this.stockMovements.push(movement);

    // Check for reorder alerts
    this.checkReorderAlerts();

    // Save to offline storage
    await offlineStorage.saveHealthRecord({
      id: `stock-${stockId}`,
      patientId: 'system',
      doctorId: null,
      appointmentId: null,
      type: 'vital',
      title: `Stock Update - ${stock.medicineName}`,
      data: { stock, movement },
      fileUrl: null,
      recordDate: null,
      value: null,
      unit: null,
      normalRange: null,
      notes: null,
      createdAt: new Date()
    });

    // Notify listeners
    this.notifyListeners();

    // Try to sync with server
    try {
      await this.syncStockToServer(stock);
    } catch (error) {
      console.warn('Failed to sync stock update to server:', error);
    }

    return stock;
  }

  private async syncStockToServer(stock: MedicineStock): Promise<void> {
    const response = await fetch(`/api/medicine-stock/${stock.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quantity: stock.currentStock,
        status: stock.status,
        lastUpdated: stock.lastUpdated
      })
    });

    if (!response.ok) {
      throw new Error('Failed to sync stock to server');
    }
  }

  private checkReorderAlerts(): void {
    this.stockData.forEach(stock => {
      if (stock.status === 'reorder_needed' || stock.status === 'out_of_stock') {
        const existingAlert = this.reorderAlerts.find(
          alert => alert.medicineId === stock.medicineId && alert.pharmacyId === stock.pharmacyId
        );

        if (!existingAlert) {
          const urgency = this.calculateUrgency(stock);
          const alert: ReorderAlert = {
            id: `alert-${Date.now()}`,
            medicineId: stock.medicineId,
            medicineName: stock.medicineName,
            pharmacyId: stock.pharmacyId,
            currentStock: stock.currentStock,
            minimumStock: stock.minimumStock,
            urgency,
            message: this.generateAlertMessage(stock, urgency),
            createdAt: new Date().toISOString(),
            acknowledged: false,
            autoOrdered: false
          };

          this.reorderAlerts.push(alert);
          
          // Auto-order for critical items
          if (urgency === 'critical') {
            this.autoOrderMedicine(stock, alert);
          }
        }
      }
    });
  }

  private calculateUrgency(stock: MedicineStock): 'low' | 'medium' | 'high' | 'critical' {
    const stockRatio = stock.currentStock / stock.minimumStock;
    
    if (stock.currentStock === 0) return 'critical';
    if (stockRatio <= 0.2) return 'critical';
    if (stockRatio <= 0.5) return 'high';
    if (stockRatio <= 0.8) return 'medium';
    return 'low';
  }

  private generateAlertMessage(stock: MedicineStock, urgency: string): string {
    const messages = {
      critical: `CRITICAL: ${stock.medicineName} is out of stock! Immediate reorder required.`,
      high: `HIGH PRIORITY: ${stock.medicineName} stock is critically low (${stock.currentStock} units). Reorder immediately.`,
      medium: `MEDIUM PRIORITY: ${stock.medicineName} stock is low (${stock.currentStock} units). Consider reordering soon.`,
      low: `LOW PRIORITY: ${stock.medicineName} stock is below minimum (${stock.currentStock} units). Plan reorder.`
    };
    
    return messages[urgency as keyof typeof messages] || 'Stock alert';
  }

  private async autoOrderMedicine(stock: MedicineStock, alert: ReorderAlert): Promise<void> {
    try {
      const orderQuantity = Math.min(stock.maximumStock - stock.currentStock, stock.minimumStock * 2);
      
      const response = await fetch('/api/medicine-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId: stock.medicineId,
          pharmacyId: stock.pharmacyId,
          quantity: orderQuantity,
          supplier: stock.supplier,
          urgency: 'critical',
          autoOrdered: true,
          alertId: alert.id
        })
      });

      if (response.ok) {
        alert.autoOrdered = true;
        alert.message += ' (Auto-ordered)';
        
        // Record the auto-order
        const movement: StockMovement = {
          id: `movement-${Date.now()}`,
          medicineId: stock.medicineId,
          pharmacyId: stock.pharmacyId,
          type: 'in',
          quantity: orderQuantity,
          reason: 'Auto-order (critical stock)',
          timestamp: new Date().toISOString(),
          userId: 'system',
          userName: 'Auto-Order System'
        };

        this.stockMovements.push(movement);
        
        console.log(`Auto-ordered ${orderQuantity} units of ${stock.medicineName}`);
      }
    } catch (error) {
      console.error('Failed to auto-order medicine:', error);
    }
  }

  // Getters
  getAllStock(): MedicineStock[] {
    return Array.from(this.stockData.values());
  }

  getStockByPharmacy(pharmacyId: string): MedicineStock[] {
    return Array.from(this.stockData.values()).filter(stock => stock.pharmacyId === pharmacyId);
  }

  getLowStockItems(): MedicineStock[] {
    return Array.from(this.stockData.values()).filter(stock => 
      stock.status === 'limited' || stock.status === 'reorder_needed' || stock.status === 'out_of_stock'
    );
  }

  getReorderAlerts(): ReorderAlert[] {
    return this.reorderAlerts.filter(alert => !alert.acknowledged);
  }

  getStockMovements(medicineId?: string, pharmacyId?: string): StockMovement[] {
    let movements = this.stockMovements;
    
    if (medicineId) {
      movements = movements.filter(movement => movement.medicineId === medicineId);
    }
    
    if (pharmacyId) {
      movements = movements.filter(movement => movement.pharmacyId === pharmacyId);
    }
    
    return movements.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Event listeners
  addListener(callback: (data: any) => void): void {
    this.listeners.add(callback);
  }

  removeListener(callback: (data: any) => void): void {
    this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const data = {
      stock: this.getAllStock(),
      alerts: this.getReorderAlerts(),
      movements: this.stockMovements.slice(-10) // Last 10 movements
    };
    
    this.listeners.forEach(callback => callback(data));
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.listeners.clear();
  }
}

export const medicineStockManager = new MedicineStockManager();
