import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { useOfflineStatus } from '@/lib/offline';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isOnline = useOfflineStatus();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 text-sm z-50">
          <i className="fas fa-wifi-slash mr-2"></i>
          ऑफलाइन मोड - Offline Mode - ਆਫਲਾਈਨ ਮੋਡ
        </div>
      )}

      <Header />
      
      <main className={`${!isOnline ? 'pt-10' : ''}`}>
        {children}
      </main>

      <BottomNavigation />
    </div>
  );
}
