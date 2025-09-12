import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { auth } from '@/lib/firebase';
import { AppointmentCard } from '@/components/AppointmentCard';
import { DoctorCard } from '@/components/DoctorCard';
import { SymptomChecker } from '@/components/SymptomChecker';
import { VideoCall } from '@/components/VideoCall';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [activeVideoCall, setActiveVideoCall] = useState<string | null>(null);

  // Use demo user if Firebase is not configured and no user is authenticated
  const currentUser = user || (!auth ? {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'patient' as const
  } : null);

  // Redirect to login if not authenticated and Firebase is configured
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const { data: appointments } = useQuery({
    queryKey: ['/api/appointments/patient', currentUser.id],
  });

  const { data: onlineDoctors } = useQuery({
    queryKey: ['/api/doctors/online'],
  });

  const { data: healthRecords } = useQuery({
    queryKey: ['/api/health-records/patient', currentUser.id],
  });

  const handleVideoConsultation = () => {
    if (onlineDoctors && onlineDoctors.length > 0) {
      const roomId = `consultation-${currentUser.id}-${Date.now()}`;
      setActiveVideoCall(roomId);
    } else {
      toast({
        title: "No Doctors Available",
        description: "No doctors are currently online for video consultation.",
        variant: "destructive"
      });
    }
  };

  const handleSymptomChecker = () => {
    setShowSymptomChecker(true);
  };

  const handleConsultDoctor = (doctor: any) => {
    const roomId = `consultation-${currentUser.id}-${doctor.id}-${Date.now()}`;
    setActiveVideoCall(roomId);
  };

  const handleJoinAppointment = (appointment: any) => {
    const roomId = `appointment-${appointment.id}`;
    setActiveVideoCall(roomId);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'सुप्रभात'; // Good morning
    if (hour < 17) return 'नमस्ते'; // Good afternoon
    return 'शुभ संध्या'; // Good evening
  };

  const mockStats = {
    nextAppointment: appointments?.length || 0,
    doctorsOnline: onlineDoctors?.length || 0,
    medicinesTracked: 5,
    recordsSynced: healthRecords?.length || 0,
  };

  const mockVitals = {
    bloodPressure: "120/80",
    weight: "68",
    glucose: "95",
    heartRate: "72"
  };

  if (activeVideoCall) {
    return (
      <VideoCall
        roomId={activeVideoCall}
        onEnd={() => setActiveVideoCall(null)}
      />
    );
  }

  if (showSymptomChecker) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setShowSymptomChecker(false)}
            data-testid="button-back-home"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Dashboard
          </Button>
        </div>
        <SymptomChecker />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Section */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2" data-testid="greeting-user">
            {getGreeting()} {currentUser.name}!
          </h2>
          <p className="text-primary-foreground/90 mb-4">आज आपका स्वास्थ्य कैसा है?</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" data-testid="stat-appointments">{mockStats.nextAppointment}</div>
              <div className="text-sm opacity-90">{t('next-appointment')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" data-testid="stat-doctors">{mockStats.doctorsOnline}</div>
              <div className="text-sm opacity-90">{t('doctors-online')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" data-testid="stat-medicines">{mockStats.medicinesTracked}</div>
              <div className="text-sm opacity-90">{t('medicines-tracked')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" data-testid="stat-records">{mockStats.recordsSynced}</div>
              <div className="text-sm opacity-90">{t('records-synced')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">{t('quick-services')} - Quick Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <button 
            className="bg-card hover:bg-accent border border-border rounded-lg p-6 text-left focus:ring-2 focus:ring-ring transition-colors"
            onClick={handleVideoConsultation}
            data-testid="button-video-consultation"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-video text-xl"></i>
              </div>
              <div>
                <h4 className="font-medium">{t('video-consultation')}</h4>
                <p className="text-sm text-muted-foreground">Video Consultation</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">डॉक्टर से तुरंत बात करें</p>
            <div className="mt-2 text-xs text-secondary font-medium">
              <i className="fas fa-circle mr-1 status-online"></i>
              {mockStats.doctorsOnline} doctors online
            </div>
          </button>

          <button 
            className="bg-card hover:bg-accent border border-border rounded-lg p-6 text-left focus:ring-2 focus:ring-ring transition-colors"
            onClick={handleSymptomChecker}
            data-testid="button-symptom-checker"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-stethoscope text-xl"></i>
              </div>
              <div>
                <h4 className="font-medium">{t('symptom-checker')}</h4>
                <p className="text-sm text-muted-foreground">Symptom Checker</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">AI से प्राथमिक जांच</p>
            <div className="mt-2 text-xs text-muted-foreground">
              <i className="fas fa-robot mr-1"></i>
              AI-powered assistance
            </div>
          </button>

          <button 
            className="bg-card hover:bg-accent border border-border rounded-lg p-6 text-left focus:ring-2 focus:ring-ring transition-colors"
            onClick={() => navigate('/records')}
            data-testid="button-health-records"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-accent text-accent-foreground rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-file-medical text-xl"></i>
              </div>
              <div>
                <h4 className="font-medium">{t('health-records')}</h4>
                <p className="text-sm text-muted-foreground">Health Records</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">अपनी मेडिकल हिस्ट्री देखें</p>
            <div className="mt-2 text-xs text-secondary font-medium">
              <i className="fas fa-download mr-1"></i>
              Offline ready
            </div>
          </button>

          <button 
            className="bg-card hover:bg-accent border border-border rounded-lg p-6 text-left focus:ring-2 focus:ring-ring transition-colors"
            onClick={() => navigate('/medicines')}
            data-testid="button-medicine-availability"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-muted text-muted-foreground rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-pills text-xl"></i>
              </div>
              <div>
                <h4 className="font-medium">{t('medicine-availability')}</h4>
                <p className="text-sm text-muted-foreground">Medicine Stock</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">फार्मेसी में दवा जांचें</p>
            <div className="mt-2 text-xs text-secondary font-medium">
              <i className="fas fa-sync-alt mr-1"></i>
              Live updates
            </div>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Appointments */}
          <section className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('upcoming-appointments')} - Upcoming Appointments</h3>
              <button 
                className="text-primary text-sm font-medium hover:underline"
                onClick={() => navigate('/profile')}
                data-testid="button-view-all-appointments"
              >
                {t('view-all')}
              </button>
            </div>
            
            <div className="space-y-4">
              {appointments && appointments.length > 0 ? (
                appointments.slice(0, 2).map((appointment: any) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onJoin={handleJoinAppointment}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-calendar-plus text-4xl text-muted-foreground mb-4"></i>
                  <h4 className="font-medium mb-2">No Upcoming Appointments</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    Book your first consultation with our online doctors
                  </p>
                  <Button onClick={() => navigate('/doctors')} data-testid="button-book-first-appointment">
                    <i className="fas fa-plus mr-2"></i>
                    Book Appointment
                  </Button>
                </div>
              )}
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate('/doctors')}
              data-testid="button-book-new-appointment"
            >
              <i className="fas fa-plus mr-2"></i>
              {t('book-appointment')}
            </Button>
          </section>

          {/* Health Records Summary */}
          <section className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('health-summary')} - Health Summary</h3>
              <div className="flex items-center text-sm text-secondary">
                <i className="fas fa-sync-alt mr-1"></i>
                Synced 2 min ago
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary" data-testid="vital-blood-pressure">{mockVitals.bloodPressure}</div>
                <div className="text-sm text-muted-foreground">Blood Pressure</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-secondary" data-testid="vital-weight">{mockVitals.weight}kg</div>
                <div className="text-sm text-muted-foreground">Weight</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-accent-foreground" data-testid="vital-glucose">{mockVitals.glucose}mg/dL</div>
                <div className="text-sm text-muted-foreground">Glucose</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-muted-foreground" data-testid="vital-heart-rate">{mockVitals.heartRate}bpm</div>
                <div className="text-sm text-muted-foreground">Heart Rate</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">हालिया रिपोर्ट्स - Recent Reports</h4>
              {healthRecords && healthRecords.length > 0 ? (
                healthRecords.slice(0, 2).map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div className="flex items-center">
                      <i className="fas fa-file-pdf text-destructive mr-3"></i>
                      <div>
                        <p className="font-medium">{record.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(record.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <button 
                      className="text-primary text-sm font-medium hover:underline"
                      onClick={() => navigate('/records')}
                      data-testid={`button-view-record-${record.id}`}
                    >
                      View
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">No recent reports available</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Online Doctors */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{t('available-doctors')} - Available Doctors</h3>
            
            <div className="space-y-4">
              {onlineDoctors && onlineDoctors.length > 0 ? (
                onlineDoctors.slice(0, 3).map((doctor: any) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onConsult={handleConsultDoctor}
                    onViewProfile={() => navigate('/doctors')}
                  />
                ))
              ) : (
                <div className="text-center py-6">
                  <i className="fas fa-user-md text-3xl text-muted-foreground mb-3"></i>
                  <p className="text-muted-foreground text-sm">No doctors currently online</p>
                </div>
              )}
            </div>

            <button 
              className="w-full mt-4 text-primary text-sm font-medium py-2 border border-border rounded-md hover:bg-muted"
              onClick={() => navigate('/doctors')}
              data-testid="button-view-all-doctors"
            >
              {t('view-all')} - View All Doctors
            </button>
          </section>

          {/* Emergency Services */}
          <section className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-destructive mb-4">{t('emergency-services')} - Emergency</h3>
            
            <div className="space-y-3">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => window.open('tel:108', '_self')}
                data-testid="button-call-108"
              >
                <i className="fas fa-ambulance mr-2"></i>
                108 - Ambulance
              </Button>
              
              <Button
                variant="outline"
                className="w-full border-destructive/20 text-destructive hover:bg-destructive/5"
                onClick={() => window.open('tel:01763222204', '_self')}
                data-testid="button-call-civil-hospital"
              >
                <i className="fas fa-hospital mr-2"></i>
                Civil Hospital Nabha
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">24x7 Emergency Support</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
