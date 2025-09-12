import { useState, useEffect } from 'react';

// IndexedDB for offline storage
interface OfflineData {
  healthRecords: any[];
  appointments: any[];
  medicines: any[];
  lastSync: number;
}

class OfflineManager {
  private dbName = 'SehatNabhaDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('healthRecords')) {
          db.createObjectStore('healthRecords', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('appointments')) {
          db.createObjectStore('appointments', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('medicines')) {
          db.createObjectStore('medicines', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  async saveHealthRecords(records: any[]): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['healthRecords'], 'readwrite');
    const store = transaction.objectStore('healthRecords');
    
    for (const record of records) {
      await store.put(record);
    }
  }

  async getHealthRecords(): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['healthRecords'], 'readonly');
      const store = transaction.objectStore('healthRecords');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveAppointments(appointments: any[]): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['appointments'], 'readwrite');
    const store = transaction.objectStore('appointments');
    
    for (const appointment of appointments) {
      await store.put(appointment);
    }
  }

  async getAppointments(): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appointments'], 'readonly');
      const store = transaction.objectStore('appointments');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async setLastSync(timestamp: number): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    await store.put({ key: 'lastSync', value: timestamp });
  }

  async getLastSync(): Promise<number> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('lastSync');
      
      request.onsuccess = () => {
        resolve(request.result?.value || 0);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    
    const stores = ['healthRecords', 'appointments', 'medicines', 'settings'];
    const transaction = this.db!.transaction(stores, 'readwrite');
    
    for (const storeName of stores) {
      const store = transaction.objectStore(storeName);
      await store.clear();
    }
  }
}

export const offlineManager = new OfflineManager();

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
