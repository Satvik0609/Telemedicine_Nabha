import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { RoleBasedNavigation } from './RoleBasedNavigation';
import { useOfflineStatus } from '@/lib/offline';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isOnline = useOfflineStatus();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      
      <div className="flex">
        {/* Sidebar for desktop */}
        {user && (
          <aside className="hidden lg:block w-64 bg-card border-r border-border min-h-screen">
            <div className="p-4">
              <RoleBasedNavigation />
            </div>
          </aside>
        )}

        {/* Mobile sidebar */}
        {user && sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <RoleBasedNavigation />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className={`flex-1 ${!isOnline ? 'pt-10' : ''}`}>
          {/* Mobile menu button */}
          {user && (
            <div className="lg:hidden p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4 mr-2" />
                Menu
              </Button>
            </div>
          )}
          
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
}
