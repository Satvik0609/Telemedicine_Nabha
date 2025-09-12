import { HealthRecords } from '@/components/HealthRecords';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';

export default function Records() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <HealthRecords />
    </div>
  );
}
