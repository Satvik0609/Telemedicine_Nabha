import { MedicineTracker } from '@/components/MedicineTracker';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';

export default function Medicines() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Medicine Availability</h1>
        <p className="text-muted-foreground">
          Track medicine stock in nearby pharmacies with live updates
        </p>
      </div>
      
      <MedicineTracker />
    </div>
  );
}
