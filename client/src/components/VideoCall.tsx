import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWebSocket } from '@/lib/websocket';
import { useAuth } from '@/contexts/AuthContext';

interface VideoCallProps {
  roomId: string;
  onEnd: () => void;
}

export function VideoCall({ roomId, onEnd }: VideoCallProps) {
  const { user } = useAuth();
  const { send, subscribe } = useWebSocket();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    initializeCall();
    
    const unsubscribeOffer = subscribe('webrtc-offer', handleOffer);
    const unsubscribeAnswer = subscribe('webrtc-answer', handleAnswer);
    const unsubscribeIceCandidate = subscribe('webrtc-ice-candidate', handleIceCandidate);
    const unsubscribeUserJoined = subscribe('user-joined', handleUserJoined);

    return () => {
      cleanup();
      unsubscribeOffer();
      unsubscribeAnswer();
      unsubscribeIceCandidate();
      unsubscribeUserJoined();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current!.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          send('webrtc-ice-candidate', {
            candidate: event.candidate,
            roomId,
          });
        }
      };

      // Join the room
      send('join-room', { roomId, userId: user?.id });
      setIsCallActive(true);
    } catch (error) {
      console.error('Error initializing call:', error);
    }
  };

  const handleUserJoined = async () => {
    // Create and send offer when another user joins
    try {
      const offer = await peerConnectionRef.current!.createOffer();
      await peerConnectionRef.current!.setLocalDescription(offer);
      
      send('webrtc-offer', {
        offer,
        roomId,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (data: any) => {
    try {
      await peerConnectionRef.current!.setRemoteDescription(data.offer);
      const answer = await peerConnectionRef.current!.createAnswer();
      await peerConnectionRef.current!.setLocalDescription(answer);
      
      send('webrtc-answer', {
        answer,
        roomId,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (data: any) => {
    try {
      await peerConnectionRef.current!.setRemoteDescription(data.answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (data: any) => {
    try {
      await peerConnectionRef.current!.addIceCandidate(data.candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    cleanup();
    onEnd();
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setIsCallActive(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          data-testid="video-remote"
        />
        
        {/* Local Video */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-4 right-4 w-32 h-24 object-cover rounded-lg border-2 border-white"
          data-testid="video-local"
        />
      </div>

      {/* Call Controls */}
      <div className="bg-black/80 p-4 flex justify-center items-center space-x-4">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="lg"
          onClick={toggleMute}
          className="rounded-full w-12 h-12"
          data-testid="button-mute"
        >
          <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
        </Button>

        <Button
          variant={isVideoOff ? "destructive" : "secondary"}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12"
          data-testid="button-video"
        >
          <i className={`fas ${isVideoOff ? 'fa-video-slash' : 'fa-video'}`}></i>
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={endCall}
          className="rounded-full w-12 h-12"
          data-testid="button-end-call"
        >
          <i className="fas fa-phone-slash"></i>
        </Button>
      </div>
    </div>
  );
}
