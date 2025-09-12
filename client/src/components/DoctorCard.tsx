import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Doctor {
  id: string;
  user: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  specialty: string;
  qualification: string;
  experience: number;
  rating: number;
  totalRatings: number;
  isOnline: boolean;
  consultationFee: number;
  languages: string[];
}

interface DoctorCardProps {
  doctor: Doctor;
  onConsult: (doctor: Doctor) => void;
  onViewProfile: (doctor: Doctor) => void;
}

export function DoctorCard({ doctor, onConsult, onViewProfile }: DoctorCardProps) {
  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'text-green-500' : 'text-gray-400';
  };

  const getStatusText = (isOnline: boolean) => {
    return isOnline ? 'Online' : 'Offline';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating / 20); // Convert rating to 5-star scale
    const hasHalfStar = (rating % 20) >= 10;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-yellow-400"></i>);
      }
    }
    return stars;
  };

  return (
    <div 
      className="p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
      onClick={() => onViewProfile(doctor)}
      data-testid={`card-doctor-${doctor.id}`}
    >
      <div className="flex items-center space-x-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={doctor.user.profilePicture || undefined} alt={doctor.user.name} />
          <AvatarFallback>
            {doctor.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium" data-testid="text-doctor-name">Dr. {doctor.user.name}</h4>
            <i className={`fas fa-circle text-xs ${getStatusColor(doctor.isOnline)}`}></i>
            <span className={`text-xs ${getStatusColor(doctor.isOnline)}`}>
              {getStatusText(doctor.isOnline)}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground" data-testid="text-doctor-specialty">
            {doctor.specialty}
          </p>
          
          <div className="flex items-center mt-1 space-x-2">
            <div className="flex">
              {renderStars(doctor.rating)}
            </div>
            <span className="text-xs text-muted-foreground">
              {(doctor.rating / 20).toFixed(1)} ({doctor.totalRatings} reviews)
            </span>
          </div>
          
          <div className="flex items-center mt-1 space-x-2">
            <Badge variant="outline" className="text-xs">
              {doctor.experience}+ years
            </Badge>
            <span className="text-xs text-muted-foreground">
              ₹{doctor.consultationFee}/consultation
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {doctor.languages.slice(0, 3).map((lang, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {lang}
              </Badge>
            ))}
            {doctor.languages.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{doctor.languages.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        <div className="text-right">
          {doctor.isOnline ? (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onConsult(doctor);
              }}
              data-testid="button-consult"
            >
              Consult Now
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile(doctor);
              }}
              data-testid="button-book-later"
            >
              Book Later
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
