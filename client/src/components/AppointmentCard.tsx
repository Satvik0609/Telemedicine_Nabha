import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface Appointment {
  id: string;
  scheduledAt: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  type: 'video' | 'audio' | 'chat';
  notes?: string;
  doctor: {
    id: string;
    user: {
      id: string;
      name: string;
      profilePicture?: string;
    };
    specialty: string;
  };
}

interface AppointmentCardProps {
  appointment: Appointment;
  onJoin?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
}

export function AppointmentCard({ appointment, onJoin, onReschedule, onCancel }: AppointmentCardProps) {
  const appointmentDate = new Date(appointment.scheduledAt);
  const isPastAppointment = isPast(appointmentDate) && appointment.status !== 'ongoing';
  
  const getDateDisplay = () => {
    if (isToday(appointmentDate)) {
      return `Today, ${format(appointmentDate, 'h:mm a')}`;
    } else if (isTomorrow(appointmentDate)) {
      return `Tomorrow, ${format(appointmentDate, 'h:mm a')}`;
    } else {
      return format(appointmentDate, 'MMM dd, h:mm a');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return 'fas fa-video';
      case 'audio':
        return 'fas fa-phone';
      case 'chat':
        return 'fas fa-comments';
      default:
        return 'fas fa-calendar';
    }
  };

  const canJoin = () => {
    const now = new Date();
    const diffMinutes = (appointmentDate.getTime() - now.getTime()) / (1000 * 60);
    return appointment.status === 'scheduled' && diffMinutes <= 15 && diffMinutes >= -15;
  };

  const canReschedule = () => {
    return appointment.status === 'scheduled' && !isPastAppointment;
  };

  return (
    <div 
      className={`p-4 rounded-lg border ${
        appointment.status === 'ongoing' ? 'bg-green-50 border-green-200' : 
        isPastAppointment ? 'bg-gray-50' : 'bg-card'
      }`}
      data-testid={`card-appointment-${appointment.id}`}
    >
      <div className="flex items-center space-x-4">
        <Avatar className="w-12 h-12">
          <AvatarImage 
            src={appointment.doctor.user.profilePicture || undefined} 
            alt={appointment.doctor.user.name} 
          />
          <AvatarFallback>
            {appointment.doctor.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h4 className="font-medium" data-testid="text-doctor-name">
            Dr. {appointment.doctor.user.name}
          </h4>
          <p className="text-sm text-muted-foreground" data-testid="text-doctor-specialty">
            {appointment.doctor.specialty}
          </p>
          
          <div className="flex items-center mt-1 space-x-2">
            <div className="flex items-center text-sm">
              <i className="fas fa-calendar mr-2 text-primary"></i>
              <span data-testid="text-appointment-date">{getDateDisplay()}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center text-sm">
              <i className={`${getTypeIcon(appointment.type)} mr-1 text-secondary`}></i>
              <span className="capitalize">{appointment.type} Call</span>
            </div>
          </div>

          {appointment.notes && (
            <p className="text-sm text-muted-foreground mt-2">
              <i className="fas fa-sticky-note mr-1"></i>
              {appointment.notes}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
          
          <div className="flex space-x-2">
            {canJoin() && onJoin && (
              <Button
                size="sm"
                onClick={() => onJoin(appointment)}
                data-testid="button-join-appointment"
              >
                <i className="fas fa-play mr-1"></i>
                Join Now
              </Button>
            )}
            
            {canReschedule() && onReschedule && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReschedule(appointment)}
                data-testid="button-reschedule"
              >
                <i className="fas fa-calendar-alt mr-1"></i>
                Reschedule
              </Button>
            )}
            
            {appointment.status === 'scheduled' && onCancel && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onCancel(appointment)}
                data-testid="button-cancel-appointment"
              >
                <i className="fas fa-times mr-1"></i>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
