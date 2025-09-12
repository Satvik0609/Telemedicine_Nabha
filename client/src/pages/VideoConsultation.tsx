import { useParams } from 'wouter';
import { VideoCall } from '@/components/VideoCall';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';

export default function VideoConsultation() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams();
  const roomId = params.roomId;

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!roomId) {
    navigate('/');
    return null;
  }

  return (
    <VideoCall
      roomId={roomId}
      onEnd={() => navigate('/')}
    />
  );
}
