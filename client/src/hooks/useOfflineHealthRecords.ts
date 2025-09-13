import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offlineStorage } from '@/lib/offlineStorage';
import { HealthRecord, InsertHealthRecord } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useOfflineHealthRecords(patientId: string) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync offline data when coming online
  const syncOfflineData = useCallback(async () => {
    if (!isOnline) return;
    
    setSyncStatus('syncing');
    try {
      await offlineStorage.syncPendingChanges();
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['health-records', patientId] });
      setSyncStatus('idle');
      
      toast({
        title: "Data Synced",
        description: "Your offline data has been synchronized with the server.",
      });
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      
      toast({
        title: "Sync Failed",
        description: "Failed to sync offline data. Will retry when connection is restored.",
        variant: "destructive",
      });
    }
  }, [isOnline, patientId, queryClient, toast]);

  // Query for health records (combines online and offline data)
  const { data: healthRecords = [], isLoading } = useQuery({
    queryKey: ['health-records', patientId],
    queryFn: async () => {
      if (isOnline) {
        try {
          // Try to fetch from server first
          const response = await fetch(`/api/health-records/patient/${patientId}`);
          if (response.ok) {
            const serverRecords = await response.json();
            // Also get offline records and merge
            const offlineRecords = await offlineStorage.getHealthRecords(patientId);
            return [...serverRecords, ...offlineRecords];
          }
        } catch (error) {
          console.warn('Failed to fetch from server, using offline data:', error);
        }
      }
      
      // Fallback to offline data
      return await offlineStorage.getHealthRecords(patientId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for creating health records
  const createHealthRecordMutation = useMutation({
    mutationFn: async (recordData: InsertHealthRecord) => {
      const newRecord: HealthRecord = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...recordData,
        doctorId: recordData.doctorId || null,
        notes: recordData.notes || null,
        appointmentId: recordData.appointmentId || null,
        fileUrl: recordData.fileUrl || null,
        recordDate: recordData.recordDate || null,
        value: recordData.value || null,
        unit: recordData.unit || null,
        normalRange: recordData.normalRange || null,
        createdAt: new Date(),
      };

      // Always save to offline storage first
      await offlineStorage.saveHealthRecord(newRecord);

      // If online, also try to sync to server
      if (isOnline) {
        try {
          const response = await fetch('/api/health-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recordData),
          });

          if (response.ok) {
            const serverRecord = await response.json();
            // Update offline storage with server response
            await offlineStorage.saveHealthRecord(serverRecord);
            return serverRecord;
          }
        } catch (error) {
          console.warn('Failed to sync to server, saved offline:', error);
        }
      }

      return newRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records', patientId] });
      
      toast({
        title: isOnline ? "Health Record Saved" : "Health Record Saved Offline",
        description: isOnline 
          ? "Your health record has been saved successfully."
          : "Your health record has been saved offline and will sync when you're back online.",
      });
    },
    onError: (error) => {
      console.error('Failed to save health record:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save health record. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get cache statistics
  const getCacheStats = useCallback(async () => {
    return await offlineStorage.getCacheSize();
  }, []);

  // Clear cache
  const clearCache = useCallback(async () => {
    await offlineStorage.clearCache();
    queryClient.invalidateQueries({ queryKey: ['health-records', patientId] });
    
    toast({
      title: "Cache Cleared",
      description: "All offline data has been cleared.",
    });
  }, [patientId, queryClient, toast]);

  // Export data
  const exportData = useCallback(async () => {
    const blob = await offlineStorage.exportData();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-records-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your health records have been exported successfully.",
    });
  }, [toast]);

  // Import data
  const importData = useCallback(async (file: File) => {
    try {
      await offlineStorage.importData(file);
      queryClient.invalidateQueries({ queryKey: ['health-records', patientId] });
      
      toast({
        title: "Data Imported",
        description: "Your health records have been imported successfully.",
      });
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import health records. Please check the file format.",
        variant: "destructive",
      });
    }
  }, [patientId, queryClient, toast]);

  return {
    healthRecords,
    isLoading,
    isOnline,
    syncStatus,
    createHealthRecord: createHealthRecordMutation.mutate,
    isCreating: createHealthRecordMutation.isPending,
    syncOfflineData,
    getCacheStats,
    clearCache,
    exportData,
    importData,
  };
}
