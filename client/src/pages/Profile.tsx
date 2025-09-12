import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AppointmentCard } from '@/components/AppointmentCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const { data: appointments } = useQuery({
    queryKey: ['/api/appointments/patient', user.id],
  });

  const { data: symptomChecks } = useQuery({
    queryKey: ['/api/symptom-checks/patient', user.id],
  });

  const handleSaveProfile = () => {
    // TODO: Implement profile update
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getAppointmentStats = () => {
    if (!appointments) return { total: 0, upcoming: 0, completed: 0 };
    
    const total = appointments.length;
    const upcoming = appointments.filter((apt: any) => apt.status === 'scheduled').length;
    const completed = appointments.filter((apt: any) => apt.status === 'completed').length;
    
    return { total, upcoming, completed };
  };

  const stats = getAppointmentStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t('profile')}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  data-testid="button-edit-profile"
                >
                  <i className="fas fa-edit"></i>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user.profilePicture || undefined} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold" data-testid="text-user-name">{user.name}</h2>
                <p className="text-muted-foreground" data-testid="text-user-email">{user.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {user.role === 'patient' ? 'Patient' : 'Doctor'}
                </Badge>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      data-testid="input-edit-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      data-testid="input-edit-phone"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveProfile} className="flex-1" data-testid="button-save-profile">
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} data-testid="button-cancel-edit">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm" data-testid="text-user-phone">
                      {user.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Member Since</Label>
                    <p className="text-sm">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Healthcare Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary" data-testid="stat-total-appointments">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total Appointments</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary" data-testid="stat-upcoming-appointments">{stats.upcoming}</div>
                  <div className="text-xs text-muted-foreground">Upcoming</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent-foreground" data-testid="stat-symptom-checks">{symptomChecks?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">AI Checks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments and History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Appointments
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/doctors')}
                  data-testid="button-book-new"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Book New
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments && appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((appointment: any) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onJoin={(apt) => navigate(`/video/appointment-${apt.id}`)}
                    />
                  ))}
                  {appointments.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm">
                        View All Appointments ({appointments.length})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-calendar-plus text-4xl text-muted-foreground mb-4"></i>
                  <h3 className="text-lg font-medium mb-2">No Appointments Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Book your first consultation with our qualified doctors
                  </p>
                  <Button onClick={() => navigate('/doctors')} data-testid="button-book-first">
                    Book First Appointment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent AI Symptom Checks */}
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Health Checks</CardTitle>
            </CardHeader>
            <CardContent>
              {symptomChecks && symptomChecks.length > 0 ? (
                <div className="space-y-4">
                  {symptomChecks.slice(0, 3).map((check: any) => (
                    <div key={check.id} className="p-4 border rounded-lg" data-testid={`symptom-check-${check.id}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Symptom Analysis</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(check.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          className={
                            check.severity === 'emergency' ? 'bg-red-100 text-red-800' :
                            check.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            check.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }
                        >
                          {check.severity}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <p><strong>Symptoms:</strong> {check.symptoms.join(', ')}</p>
                        <p className="mt-1"><strong>Assessment:</strong> {check.aiResponse.possibleConditions[0]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <i className="fas fa-stethoscope text-3xl text-muted-foreground mb-3"></i>
                  <p className="text-muted-foreground">No AI health checks performed yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-16"
                  onClick={() => navigate('/records')}
                  data-testid="button-view-records"
                >
                  <div className="text-center">
                    <i className="fas fa-file-medical text-xl mb-1"></i>
                    <div className="text-sm">Health Records</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-16"
                  onClick={() => navigate('/medicines')}
                  data-testid="button-track-medicines"
                >
                  <div className="text-center">
                    <i className="fas fa-pills text-xl mb-1"></i>
                    <div className="text-sm">Track Medicines</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
