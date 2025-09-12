import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

export function BottomNavigation() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: '/', icon: 'fas fa-home', label: t('dashboard'), testId: 'nav-home' },
    { path: '/doctors', icon: 'fas fa-user-md', label: t('doctors'), testId: 'nav-doctors' },
    { path: '/records', icon: 'fas fa-file-medical', label: t('health-records'), testId: 'nav-records' },
    { path: '/medicines', icon: 'fas fa-pills', label: t('medicines'), testId: 'nav-medicines' },
    { path: '/profile', icon: 'fas fa-user', label: t('profile'), testId: 'nav-profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center py-2 px-3 ${
              location === item.path ? 'text-primary' : 'text-muted-foreground'
            } hover:text-primary transition-colors`}
            data-testid={item.testId}
          >
            <i className={`${item.icon} text-lg`}></i>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
