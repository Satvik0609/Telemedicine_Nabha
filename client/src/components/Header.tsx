import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const handleEmergencyCall = () => {
    window.open('tel:108', '_self');
  };

  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary" data-testid="app-title">
                <i className="fas fa-heartbeat mr-2"></i>
                सेहत नाभा
              </h1>
              <p className="text-xs text-muted-foreground">Sehat Nabha</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSwitcher />
            
            {/* Emergency Button */}
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleEmergencyCall}
              data-testid="button-emergency"
            >
              <i className="fas fa-phone-alt mr-2"></i>
              {t('emergency')}
            </Button>
            
            {/* User Profile */}
            {user && (
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.profilePicture || undefined} alt={user.name} />
                  <AvatarFallback>
                    <i className="fas fa-user text-sm"></i>
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline" data-testid="text-username">
                  {user.name}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="hidden sm:inline-flex"
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
