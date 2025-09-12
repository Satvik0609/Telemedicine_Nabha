import { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'hi' | 'pa' | 'en';
  setLanguage: (lang: 'hi' | 'pa' | 'en') => void;
  t: (key: string) => string;
}

const translations = {
  hi: {
    welcome: 'नमस्ते',
    dashboard: 'डैशबोर्ड',
    doctors: 'डॉक्टर',
    appointments: 'अपॉइंटमेंट',
    'health-records': 'स्वास्थ्य रिकॉर्ड',
    medicines: 'दवाएं',
    profile: 'प्रोफाइल',
    'video-consultation': 'वीडियो परामर्श',
    'symptom-checker': 'लक्षण जांच',
    'medicine-availability': 'दवा उपलब्धता',
    emergency: 'आपातकाल',
    'book-appointment': 'अपॉइंटमेंट बुक करें',
    'view-all': 'सभी देखें',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',
    busy: 'व्यस्त',
    available: 'उपलब्ध',
    'limited-stock': 'सीमित स्टॉक',
    'out-of-stock': 'स्टॉक में नहीं',
    'next-appointment': 'अगली अपॉइंटमेंट',
    'doctors-online': 'ऑनलाइन डॉक्टर',
    'medicines-tracked': 'दवाएं उपलब्ध',
    'records-synced': 'रिकॉर्ड सुरक्षित',
    'quick-services': 'त्वरित सेवाएं',
    'upcoming-appointments': 'आगामी अपॉइंटमेंट',
    'health-summary': 'स्वास्थ्य रिकॉर्ड',
    'available-doctors': 'उपलब्ध डॉक्टर',
    'medicine-status': 'दवा स्थिति',
    'emergency-services': 'आपातकालीन सेवाएं',
  },
  pa: {
    welcome: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    doctors: 'ਡਾਕਟਰ',
    appointments: 'ਮੁਲਾਕਾਤ',
    'health-records': 'ਸਿਹਤ ਰਿਕਾਰਡ',
    medicines: 'ਦਵਾਈਆਂ',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    'video-consultation': 'ਵੀਡੀਓ ਸਲਾਹ',
    'symptom-checker': 'ਲੱਛਣ ਜਾਂਚ',
    'medicine-availability': 'ਦਵਾਈ ਉਪਲਬਧਤਾ',
    emergency: 'ਐਮਰਜੈਂਸੀ',
    'book-appointment': 'ਮੁਲਾਕਾਤ ਬੁੱਕ ਕਰੋ',
    'view-all': 'ਸਭ ਦੇਖੋ',
    online: 'ਔਨਲਾਈਨ',
    offline: 'ਔਫਲਾਈਨ',
    busy: 'ਰੁੱਝਿਆ',
    available: 'ਉਪਲਬਧ',
    'limited-stock': 'ਸੀਮਿਤ ਸਟਾਕ',
    'out-of-stock': 'ਸਟਾਕ ਵਿੱਚ ਨਹੀਂ',
    'next-appointment': 'ਅਗਲੀ ਮੁਲਾਕਾਤ',
    'doctors-online': 'ਔਨਲਾਈਨ ਡਾਕਟਰ',
    'medicines-tracked': 'ਦਵਾਈਆਂ ਉਪਲਬਧ',
    'records-synced': 'ਰਿਕਾਰਡ ਸੁਰੱਖਿਅਤ',
    'quick-services': 'ਤੇਜ਼ ਸੇਵਾਵਾਂ',
    'upcoming-appointments': 'ਆਉਣ ਵਾਲੀਆਂ ਮੁਲਾਕਾਤਾਂ',
    'health-summary': 'ਸਿਹਤ ਰਿਕਾਰਡ',
    'available-doctors': 'ਉਪਲਬਧ ਡਾਕਟਰ',
    'medicine-status': 'ਦਵਾਈ ਸਥਿਤੀ',
    'emergency-services': 'ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ',
  },
  en: {
    welcome: 'Welcome',
    dashboard: 'Dashboard',
    doctors: 'Doctors',
    appointments: 'Appointments',
    'health-records': 'Health Records',
    medicines: 'Medicines',
    profile: 'Profile',
    'video-consultation': 'Video Consultation',
    'symptom-checker': 'Symptom Checker',
    'medicine-availability': 'Medicine Availability',
    emergency: 'Emergency',
    'book-appointment': 'Book Appointment',
    'view-all': 'View All',
    online: 'Online',
    offline: 'Offline',
    busy: 'Busy',
    available: 'Available',
    'limited-stock': 'Limited Stock',
    'out-of-stock': 'Out of Stock',
    'next-appointment': 'Next Appointment',
    'doctors-online': 'Doctors Online',
    'medicines-tracked': 'Medicines Available',
    'records-synced': 'Records Synced',
    'quick-services': 'Quick Services',
    'upcoming-appointments': 'Upcoming Appointments',
    'health-summary': 'Health Summary',
    'available-doctors': 'Available Doctors',
    'medicine-status': 'Medicine Status',
    'emergency-services': 'Emergency Services',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'hi' | 'pa' | 'en'>('hi');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'hi' | 'pa' | 'en';
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: 'hi' | 'pa' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
