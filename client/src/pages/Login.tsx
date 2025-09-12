import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { login } from '@/lib/firebase';

export default function Login() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = () => {
    login();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-primary" data-testid="app-title">
              <i className="fas fa-heartbeat mr-2"></i>
              सेहत नाभा
            </h1>
            <p className="text-sm text-muted-foreground">Sehat Nabha</p>
          </div>
          <CardTitle className="text-xl">Welcome to Rural Healthcare</CardTitle>
          <p className="text-muted-foreground">
            Connect with doctors, manage health records, and access medicines from anywhere
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <i className="fas fa-video text-2xl text-primary mb-2"></i>
              <p className="text-xs">Video Consults</p>
            </div>
            <div>
              <i className="fas fa-file-medical text-2xl text-secondary mb-2"></i>
              <p className="text-xs">Health Records</p>
            </div>
            <div>
              <i className="fas fa-pills text-2xl text-accent-foreground mb-2"></i>
              <p className="text-xs">Medicine Tracker</p>
            </div>
          </div>

          <Button 
            onClick={handleGoogleLogin}
            className="w-full"
            size="lg"
            data-testid="button-google-login"
          >
            <i className="fab fa-google mr-2"></i>
            Continue with Google
          </Button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Secure login powered by Firebase Authentication
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-center">Multilingual Support</h4>
            <div className="flex justify-center space-x-4 text-sm">
              <span>हिंदी</span>
              <span>ਪੰਜਾਬੀ</span>
              <span>English</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
