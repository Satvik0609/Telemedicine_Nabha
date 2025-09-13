import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Users, 
  FileText, 
  Pill, 
  User, 
  Video, 
  Stethoscope,
  Package,
  Settings,
  BarChart3,
  Shield
} from 'lucide-react';
import { useLocation } from 'wouter';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  roles: string[];
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: Home,
    roles: ['patient', 'doctor', 'pharmacist', 'admin'],
    description: 'Main dashboard'
  },
  {
    path: '/doctors',
    label: 'Doctors',
    icon: Stethoscope,
    roles: ['patient'],
    description: 'Find and book doctors'
  },
  {
    path: '/records',
    label: 'Health Records',
    icon: FileText,
    roles: ['patient', 'doctor'],
    description: 'Medical records and reports'
  },
  {
    path: '/medicines',
    label: 'Medicines',
    icon: Pill,
    roles: ['patient'],
    description: 'Medicine availability and tracking'
  },
  {
    path: '/pharmacist',
    label: 'Pharmacy Dashboard',
    icon: Package,
    roles: ['pharmacist'],
    description: 'Manage pharmacy operations'
  },
  {
    path: '/admin',
    label: 'Admin Dashboard',
    icon: Shield,
    roles: ['admin'],
    description: 'System administration'
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: User,
    roles: ['patient', 'doctor', 'pharmacist', 'admin'],
    description: 'User profile and settings'
  }
];

export function RoleBasedNavigation() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, navigate] = useLocation();

  if (!user) return null;

  const userRole = user.role;
  const availableItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patient': return 'bg-blue-100 text-blue-800';
      case 'doctor': return 'bg-green-100 text-green-800';
      case 'pharmacist': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* User Info */}
      <div className="p-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm opacity-90">{user.email}</p>
          </div>
          <Badge className={getRoleColor(userRole)}>
            {userRole.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="space-y-2">
        {availableItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              onClick={() => navigate(item.path)}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Quick Actions based on role */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          Quick Actions
        </h4>
        <div className="space-y-2">
          {userRole === 'patient' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/doctors')}
              >
                <Video className="h-4 w-4 mr-2" />
                Book Video Consultation
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/medicines')}
              >
                <Pill className="h-4 w-4 mr-2" />
                Check Medicine Stock
              </Button>
            </>
          )}
          
          {userRole === 'doctor' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/records')}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Patient Records
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/profile')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Update Availability
              </Button>
            </>
          )}
          
          {userRole === 'pharmacist' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/pharmacist')}
              >
                <Package className="h-4 w-4 mr-2" />
                Manage Stock
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/pharmacist')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Process Prescriptions
              </Button>
            </>
          )}
          
          {userRole === 'admin' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/admin')}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/admin')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
