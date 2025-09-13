import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { HealthRecord, Appointment, SymptomCheck } from '@shared/schema';

interface OfflineDB extends DBSchema {
  healthRecords: {
    key: string;
    value: HealthRecord;
    indexes: { 'by-patient': string; 'by-date': string };
  };
  appointments: {
    key: string;
    value: Appointment;
    indexes: { 'by-patient': string; 'by-date': string };
  };
  symptomChecks: {
    key: string;
    value: SymptomCheck;
    indexes: { 'by-patient': string; 'by-date': string };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: 'create' | 'update' | 'delete';
      table: string;
      data: any;
      timestamp: number;
      retryCount: number;
    };
  };
}

class OfflineStorageService {
  private db: IDBPDatabase<OfflineDB> | null = null;
  private isOnline: boolean = navigator.onLine;

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<OfflineDB>('sehatsetu-offline', 1, {
      upgrade(db) {
        // Health Records store
        const healthRecordsStore = db.createObjectStore('healthRecords', {
          keyPath: 'id',
        });
        healthRecordsStore.createIndex('by-patient', 'patientId');
        healthRecordsStore.createIndex('by-date', 'createdAt');

        // Appointments store
        const appointmentsStore = db.createObjectStore('appointments', {
          keyPath: 'id',
        });
        appointmentsStore.createIndex('by-patient', 'patientId');
        appointmentsStore.createIndex('by-date', 'scheduledAt');

        // Symptom Checks store
        const symptomChecksStore = db.createObjectStore('symptomChecks', {
          keyPath: 'id',
        });
        symptomChecksStore.createIndex('by-patient', 'patientId');
        symptomChecksStore.createIndex('by-date', 'createdAt');

        // Sync Queue store
        db.createObjectStore('syncQueue', {
          keyPath: 'id',
        });
      },
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Health Records operations
  async saveHealthRecord(record: HealthRecord): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('healthRecords', record);
    
    if (this.isOnline) {
      try {
        await this.syncToServer('healthRecords', record);
      } catch (error) {
        console.error('Failed to sync health record:', error);
        await this.addToSyncQueue('create', 'healthRecords', record);
      }
    } else {
      await this.addToSyncQueue('create', 'healthRecords', record);
    }
  }

  async getHealthRecords(patientId: string): Promise<HealthRecord[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getAllFromIndex('healthRecords', 'by-patient', patientId);
  }

  async getAllHealthRecords(): Promise<HealthRecord[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getAll('healthRecords');
  }

  // Appointments operations
  async saveAppointment(appointment: Appointment): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('appointments', appointment);
    
    if (this.isOnline) {
      try {
        await this.syncToServer('appointments', appointment);
      } catch (error) {
        console.error('Failed to sync appointment:', error);
        await this.addToSyncQueue('create', 'appointments', appointment);
      }
    } else {
      await this.addToSyncQueue('create', 'appointments', appointment);
    }
  }

  async getAppointments(patientId: string): Promise<Appointment[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getAllFromIndex('appointments', 'by-patient', patientId);
  }

  // Symptom Checks operations
  async saveSymptomCheck(check: SymptomCheck): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('symptomChecks', check);
    
    if (this.isOnline) {
      try {
        await this.syncToServer('symptomChecks', check);
      } catch (error) {
        console.error('Failed to sync symptom check:', error);
        await this.addToSyncQueue('create', 'symptomChecks', check);
      }
    } else {
      await this.addToSyncQueue('create', 'symptomChecks', check);
    }
  }

  async getSymptomChecks(patientId: string): Promise<SymptomCheck[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getAllFromIndex('symptomChecks', 'by-patient', patientId);
  }

  // Sync operations
  private async addToSyncQueue(
    type: 'create' | 'update' | 'delete',
    table: string,
    data: any
  ): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const syncItem = {
      id: `${table}-${data.id}-${Date.now()}`,
      type,
      table,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    await this.db.put('syncQueue', syncItem);
  }

  async syncPendingChanges(): Promise<void> {
    await this.initialize();
    if (!this.db || !this.isOnline) return;

    const syncItems = await this.db.getAll('syncQueue');
    
    for (const item of syncItems) {
      try {
        await this.syncToServer(item.table, item.data);
        await this.db.delete('syncQueue', item.id);
      } catch (error) {
        console.error(`Failed to sync ${item.table}:`, error);
        item.retryCount++;
        
        if (item.retryCount < 3) {
          await this.db.put('syncQueue', item);
        } else {
          // Remove from queue after 3 failed attempts
          await this.db.delete('syncQueue', item.id);
        }
      }
    }
  }

  private async syncToServer(table: string, data: any): Promise<void> {
    const endpoint = `/api/${table}`;
    const method = 'POST';
    
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
  }

  // Cache management
  async clearCache(): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.clear('healthRecords');
    await this.db.clear('appointments');
    await this.db.clear('symptomChecks');
    await this.db.clear('syncQueue');
  }

  async getCacheSize(): Promise<{ records: number; appointments: number; symptoms: number; syncQueue: number }> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const records = await this.db.count('healthRecords');
    const appointments = await this.db.count('appointments');
    const symptoms = await this.db.count('symptomChecks');
    const syncQueue = await this.db.count('syncQueue');

    return { records, appointments, symptoms, syncQueue };
  }

  // Export/Import for backup
  async exportData(): Promise<Blob> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const data = {
      healthRecords: await this.db.getAll('healthRecords'),
      appointments: await this.db.getAll('appointments'),
      symptomChecks: await this.db.getAll('symptomChecks'),
      exportDate: new Date().toISOString(),
    };

    return new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
  }

  async importData(file: File): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const text = await file.text();
    const data = JSON.parse(text);

    if (data.healthRecords) {
      for (const record of data.healthRecords) {
        await this.db.put('healthRecords', record);
      }
    }

    if (data.appointments) {
      for (const appointment of data.appointments) {
        await this.db.put('appointments', appointment);
      }
    }

    if (data.symptomChecks) {
      for (const check of data.symptomChecks) {
        await this.db.put('symptomChecks', check);
      }
    }
  }
}

export const offlineStorage = new OfflineStorageService();

// Initialize offline storage when the app starts
if (typeof window !== 'undefined') {
  offlineStorage.initialize().catch(console.error);
}
