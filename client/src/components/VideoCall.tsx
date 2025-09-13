import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/lib/websocket';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface VideoCallProps {
  roomId: string;
  onEnd: () => void;
}

export function VideoCall({ roomId, onEnd }: VideoCallProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { send, subscribe } = useWebSocket();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'failed'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const [callQuality, setCallQuality] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    initializeCall();
    
    const unsubscribeOffer = subscribe('webrtc-offer', handleOffer);
    const unsubscribeAnswer = subscribe('webrtc-answer', handleAnswer);
    const unsubscribeIceCandidate = subscribe('webrtc-ice-candidate', handleIceCandidate);
    const unsubscribeUserJoined = subscribe('user-joined', handleUserJoined);

    // Call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      cleanup();
      clearInterval(timer);
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

      // Create peer connection with enhanced configuration
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          // Add TURN servers for better connectivity in rural areas
          { 
            urls: 'turn:turn.sehatsetu.com:3478',
            username: 'sehatsetu',
            credential: 'turnpassword'
          }
        ],
        iceCandidatePoolSize: 10,
      });

      // Monitor connection state
      peerConnectionRef.current.onconnectionstatechange = () => {
        const state = peerConnectionRef.current?.connectionState;
        if (state === 'connected') {
          setConnectionState('connected');
          setCallQuality('high');
        } else if (state === 'connecting') {
          setConnectionState('connecting');
        } else if (state === 'disconnected' || state === 'failed') {
          setConnectionState('failed');
          toast({
            title: "Connection Lost",
            description: "Attempting to reconnect...",
            variant: "destructive"
          });
        }
      };

      // Monitor ICE connection state
      peerConnectionRef.current.oniceconnectionstatechange = () => {
        const iceState = peerConnectionRef.current?.iceConnectionState;
        if (iceState === 'connected') {
          setCallQuality('high');
        } else if (iceState === 'checking') {
          setCallQuality('medium');
        } else if (iceState === 'disconnected') {
          setCallQuality('low');
        }
      };

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

  const switchToFallback = () => {
    setUseFallback(true);
    toast({
      title: "Switching to Fallback",
      description: "Using Jitsi Meet for better connectivity",
    });
    // In a real implementation, this would open Jitsi Meet
    window.open(`https://meet.jit.si/${roomId}`, '_blank');
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityColor = () => {
    switch (callQuality) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  if (useFallback) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Fallback Video Call</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Opening Jitsi Meet for better connectivity...
            </p>
            <div className="flex justify-center space-x-2">
              <Button onClick={() => setUseFallback(false)} variant="outline">
                Back to WebRTC
              </Button>
              <Button onClick={endCall} variant="destructive">
                End Call
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Status Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="flex space-x-2">
          <Badge className={getConnectionStatusColor()}>
            {connectionState.toUpperCase()}
          </Badge>
          <Badge className={getQualityColor()}>
            {callQuality.toUpperCase()} QUALITY
          </Badge>
          <Badge variant="outline" className="text-white border-white">
            {formatDuration(callDuration)}
          </Badge>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={switchToFallback}
            className="text-white border-white hover:bg-white hover:text-black"
          >
            <i className="fas fa-external-link-alt mr-1"></i>
            Fallback
          </Button>
        </div>
      </div>

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
          className="absolute top-16 right-4 w-32 h-24 object-cover rounded-lg border-2 border-white"
          data-testid="video-local"
        />

        {/* Connection Issues Overlay */}
        {connectionState === 'failed' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Card className="w-80">
              <CardHeader>
                <CardTitle className="text-center text-red-600">
                  Connection Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-gray-600">
                  Having trouble connecting? Try our fallback option for better connectivity.
                </p>
                <div className="flex justify-center space-x-2">
                  <Button onClick={switchToFallback} variant="outline">
                    Use Fallback
                  </Button>
                  <Button onClick={endCall} variant="destructive">
                    End Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
