import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHealthRecords } from '@/hooks/useAppointments';
import { useOfflineStatus, offlineManager } from '@/lib/offline';
import { format } from 'date-fns';

interface HealthRecord {
  id: string;
  type: 'vital' | 'report' | 'prescription' | 'diagnosis';
  title: string;
  data: any;
  fileUrl?: string;
  createdAt: string;
}

export function HealthRecords() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isOnline = useOfflineStatus();
  const [offlineRecords, setOfflineRecords] = useState<HealthRecord[]>([]);

  const { data: onlineRecords = [], isLoading } = useHealthRecords();

  useEffect(() => {
    // Load offline records when component mounts
    loadOfflineRecords();
  }, []);

  useEffect(() => {
    // Sync records when coming back online
    if (isOnline && onlineRecords) {
      offlineManager.saveHealthRecords(onlineRecords);
      offlineManager.setLastSync(Date.now());
    }
  }, [isOnline, onlineRecords]);

  const loadOfflineRecords = async () => {
    try {
      const records = await offlineManager.getHealthRecords();
      setOfflineRecords(records);
    } catch (error) {
      console.error('Error loading offline records:', error);
    }
  };

  const records = isOnline ? onlineRecords : offlineRecords;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vital':
        return 'bg-blue-100 text-blue-800';
      case 'report':
        return 'bg-green-100 text-green-800';
      case 'prescription':
        return 'bg-purple-100 text-purple-800';
      case 'diagnosis':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vital':
        return 'fas fa-heartbeat';
      case 'report':
        return 'fas fa-file-medical';
      case 'prescription':
        return 'fas fa-prescription-bottle';
      case 'diagnosis':
        return 'fas fa-stethoscope';
      default:
        return 'fas fa-file';
    }
  };

  const renderVitalData = (data: any) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.bloodPressure && (
        <div className="text-center">
          <div className="text-lg font-bold">{data.bloodPressure}</div>
          <div className="text-xs text-muted-foreground">Blood Pressure</div>
        </div>
      )}
      {data.weight && (
        <div className="text-center">
          <div className="text-lg font-bold">{data.weight}kg</div>
          <div className="text-xs text-muted-foreground">Weight</div>
        </div>
      )}
      {data.glucose && (
        <div className="text-center">
          <div className="text-lg font-bold">{data.glucose}mg/dL</div>
          <div className="text-xs text-muted-foreground">Glucose</div>
        </div>
      )}
      {data.heartRate && (
        <div className="text-center">
          <div className="text-lg font-bold">{data.heartRate}bpm</div>
          <div className="text-xs text-muted-foreground">Heart Rate</div>
        </div>
      )}
    </div>
  );

  const renderPrescriptionData = (data: any) => (
    <div className="space-y-2">
      {data.medicines?.map((medicine: any, index: number) => (
        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
          <div>
            <div className="font-medium">{medicine.name}</div>
            <div className="text-sm text-muted-foreground">{medicine.dosage}</div>
          </div>
          <div className="text-sm">
            {medicine.frequency} - {medicine.duration}
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('health-records')}</h2>
        <div className="flex items-center space-x-2">
          {!isOnline && (
            <Badge variant="secondary" data-testid="badge-offline">
              <i className="fas fa-wifi-slash mr-1"></i>
              Offline Mode
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadOfflineRecords}
            data-testid="button-refresh-records"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh
          </Button>
        </div>
      </div>

      {!records || records.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <i className="fas fa-file-medical text-4xl text-muted-foreground mb-4"></i>
            <h3 className="text-lg font-medium mb-2">No Health Records</h3>
            <p className="text-muted-foreground">
              Your health records will appear here once you have consultations or add medical data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((record: HealthRecord) => (
            <Card key={record.id} data-testid={`card-record-${record.id}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <i className={`${getTypeIcon(record.type)} text-lg`}></i>
                    <div>
                      <CardTitle className="text-lg">{record.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(record.createdAt), 'MMM dd, yyyy • hh:mm a')}
                      </p>
                    </div>
                  </div>
                  <Badge className={getTypeColor(record.type)}>
                    {record.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {record.type === 'vital' && renderVitalData(record.data)}
                {record.type === 'prescription' && renderPrescriptionData(record.data)}
                {record.type === 'diagnosis' && (
                  <div className="space-y-2">
                    <p className="font-medium">Diagnosis:</p>
                    <p className="text-sm">{record.data.diagnosis}</p>
                    {record.data.notes && (
                      <div>
                        <p className="font-medium mt-3">Notes:</p>
                        <p className="text-sm text-muted-foreground">{record.data.notes}</p>
                      </div>
                    )}
                  </div>
                )}
                {record.type === 'report' && (
                  <div className="space-y-2">
                    <p className="text-sm">{record.data.summary}</p>
                    {record.fileUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(record.fileUrl, '_blank')}
                        data-testid={`button-download-${record.id}`}
                      >
                        <i className="fas fa-download mr-2"></i>
                        Download Report
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
