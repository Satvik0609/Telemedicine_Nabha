import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DoctorCard } from '@/components/DoctorCard';
import { VideoCall } from '@/components/VideoCall';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDoctors, useOnlineDoctors } from '@/hooks/useAppointments';
import { useToast } from '@/hooks/use-toast';

export default function Doctors() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [activeVideoCall, setActiveVideoCall] = useState<string | null>(null);

  const { data: onlineDoctors = [] } = useOnlineDoctors();
  const { data: allDoctors = [] } = useDoctors();

  const doctors = selectedSpecialty 
    ? allDoctors.filter((doctor: any) => doctor.specialty === selectedSpecialty)
    : onlineDoctors;

  const filteredDoctors = doctors?.filter((doctor: any) =>
    doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const specialties = [
    'General Medicine',
    'Cardiology',
    'Pediatrics',
    'Dermatology',
    'Orthopedics',
    'Gynecology',
    'Neurology',
    'Psychiatry',
    'ENT',
    'Ophthalmology'
  ];

  const handleConsultDoctor = (doctor: any) => {
    if (!doctor.isOnline) {
      toast({
        title: "Doctor Not Available",
        description: "This doctor is currently offline. Please try booking an appointment.",
        variant: "destructive"
      });
      return;
    }

    const roomId = `consultation-${user?.id}-${doctor.id}-${Date.now()}`;
    setActiveVideoCall(roomId);
  };

  const handleViewProfile = (doctor: any) => {
    setSelectedDoctor(doctor);
  };

  const handleBookAppointment = (doctor: any) => {
    // TODO: Implement appointment booking
    toast({
      title: "Appointment Booking",
      description: "Appointment booking feature will be available soon.",
    });
  };

  if (activeVideoCall) {
    return (
      <VideoCall
        roomId={activeVideoCall}
        onEnd={() => setActiveVideoCall(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('doctors')} - Find Doctors</h1>
        <p className="text-muted-foreground">Connect with qualified doctors for video consultations</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-search mr-2"></i>
            Search Doctors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by doctor name or specialty"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-doctors"
            />
            
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger data-testid="select-specialty">
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('');
              }}
              data-testid="button-clear-filters"
            >
              <i className="fas fa-times mr-2"></i>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Online Status Filter */}
      <div className="flex space-x-2 mb-6">
        <Badge variant="secondary" className="cursor-pointer">
          <i className="fas fa-circle text-green-500 mr-1"></i>
          Online ({onlineDoctors?.filter((d: any) => d.isOnline).length || 0})
        </Badge>
        <Badge variant="outline" className="cursor-pointer">
          <i className="fas fa-circle text-gray-400 mr-1"></i>
          All Doctors ({doctors?.length || 0})
        </Badge>
      </div>

      {/* Doctors List */}
      <div className="space-y-4">
        {filteredDoctors && filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor: any) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onConsult={handleConsultDoctor}
              onViewProfile={handleViewProfile}
            />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <i className="fas fa-user-md text-6xl text-muted-foreground mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">No Doctors Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedSpecialty 
                  ? 'Try adjusting your search criteria'
                  : 'No doctors are currently available'
                }
              </p>
              {(searchTerm || selectedSpecialty) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialty('');
                  }}
                  data-testid="button-clear-search"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Doctor Profile Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Dr. {selectedDoctor.user.name}</CardTitle>
                  <p className="text-muted-foreground">{selectedDoctor.specialty}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDoctor(null)}
                  data-testid="button-close-profile"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Professional Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Qualification:</strong> {selectedDoctor.qualification}</p>
                    <p><strong>Experience:</strong> {selectedDoctor.experience}+ years</p>
                    <p><strong>Rating:</strong> {(selectedDoctor.rating / 20).toFixed(1)}/5 ({selectedDoctor.totalRatings} reviews)</p>
                    <p><strong>Consultation Fee:</strong> ₹{selectedDoctor.consultationFee}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.languages.map((lang: string, index: number) => (
                      <Badge key={index} variant="secondary">{lang}</Badge>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <Badge 
                      className={selectedDoctor.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      <i className={`fas fa-circle mr-1 ${selectedDoctor.isOnline ? 'text-green-500' : 'text-gray-400'}`}></i>
                      {selectedDoctor.isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                {selectedDoctor.isOnline ? (
                  <Button
                    className="flex-1"
                    onClick={() => handleConsultDoctor(selectedDoctor)}
                    data-testid="button-start-consultation"
                  >
                    <i className="fas fa-video mr-2"></i>
                    Start Video Consultation
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => handleBookAppointment(selectedDoctor)}
                    data-testid="button-book-appointment"
                  >
                    <i className="fas fa-calendar mr-2"></i>
                    Book Appointment
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setSelectedDoctor(null)}
                  data-testid="button-close-profile-footer"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
