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
    
    // Pharmacist Dashboard
    'pharmacist-dashboard': 'फार्मासिस्ट डैशबोर्ड',
    'medicine-stock': 'दवा स्टॉक',
    'stock-management': 'स्टॉक प्रबंधन',
    'prescription-processing': 'पर्चे प्रसंस्करण',
    'stock-alerts': 'स्टॉक अलर्ट',
    'reorder-needed': 'पुनः आदेश आवश्यक',
    'scan-qr-code': 'QR कोड स्कैन करें',
    'add-medicine': 'दवा जोड़ें',
    'update-stock': 'स्टॉक अपडेट करें',
    'current-stock': 'वर्तमान स्टॉक',
    'minimum-stock': 'न्यूनतम स्टॉक',
    'supplier': 'आपूर्तिकर्ता',
    'batch-number': 'बैच नंबर',
    'expiry-date': 'समाप्ति तिथि',
    'auto-ordered': 'स्वचालित आदेश',
    'manual-order': 'मैनुअल आदेश',
    'acknowledge': 'स्वीकार करें',
    
    // Admin Dashboard
    'admin-dashboard': 'एडमिन डैशबोर्ड',
    'user-management': 'उपयोगकर्ता प्रबंधन',
    'system-analytics': 'सिस्टम एनालिटिक्स',
    'audit-logs': 'ऑडिट लॉग',
    'government-reports': 'सरकारी रिपोर्ट',
    'system-settings': 'सिस्टम सेटिंग्स',
    'security-settings': 'सुरक्षा सेटिंग्स',
    'backup-frequency': 'बैकअप आवृत्ति',
    'session-timeout': 'सत्र समय सीमा',
    'password-policy': 'पासवर्ड नीति',
    'maintenance-mode': 'रखरखाव मोड',
    
    // Analytics
    'analytics-dashboard': 'एनालिटिक्स डैशबोर्ड',
    'disease-patterns': 'रोग पैटर्न',
    'medicine-usage': 'दवा उपयोग',
    'appointment-trends': 'अपॉइंटमेंट ट्रेंड',
    'regional-data': 'क्षेत्रीय डेटा',
    'user-growth': 'उपयोगकर्ता वृद्धि',
    'total-users': 'कुल उपयोगकर्ता',
    'active-doctors': 'सक्रिय डॉक्टर',
    'total-appointments': 'कुल अपॉइंटमेंट',
    'completed-consultations': 'पूर्ण परामर्श',
    'medicine-shortages': 'दवा की कमी',
    'revenue': 'राजस्व',
    'export-report': 'रिपोर्ट निर्यात करें',
    'generate-report': 'रिपोर्ट जेनरेट करें',
    
    // Common Actions
    'save': 'सहेजें',
    'cancel': 'रद्द करें',
    'delete': 'हटाएं',
    'edit': 'संपादित करें',
    'add': 'जोड़ें',
    'remove': 'हटाएं',
    'search': 'खोजें',
    'filter': 'फिल्टर करें',
    'refresh': 'रिफ्रेश करें',
    'export': 'निर्यात करें',
    'import': 'आयात करें',
    'download': 'डाउनलोड करें',
    'upload': 'अपलोड करें',
    'submit': 'जमा करें',
    'reset': 'रीसेट करें',
    'confirm': 'पुष्टि करें',
    'back': 'वापस',
    'next': 'अगला',
    'previous': 'पिछला',
    'close': 'बंद करें',
    'open': 'खोलें',
    'loading': 'लोड हो रहा है',
    'error': 'त्रुटि',
    'success': 'सफलता',
    'warning': 'चेतावनी',
    'info': 'जानकारी',
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
    
    // Pharmacist Dashboard
    'pharmacist-dashboard': 'ਫਾਰਮਾਸਿਸਟ ਡੈਸ਼ਬੋਰਡ',
    'medicine-stock': 'ਦਵਾਈ ਸਟਾਕ',
    'stock-management': 'ਸਟਾਕ ਪ੍ਰਬੰਧਨ',
    'prescription-processing': 'ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਪ੍ਰੋਸੈਸਿੰਗ',
    'stock-alerts': 'ਸਟਾਕ ਅਲਰਟ',
    'reorder-needed': 'ਦੁਬਾਰਾ ਆਰਡਰ ਲੋੜੀਂਦਾ',
    'scan-qr-code': 'QR ਕੋਡ ਸਕੈਨ ਕਰੋ',
    'add-medicine': 'ਦਵਾਈ ਜੋੜੋ',
    'update-stock': 'ਸਟਾਕ ਅਪਡੇਟ ਕਰੋ',
    'current-stock': 'ਮੌਜੂਦਾ ਸਟਾਕ',
    'minimum-stock': 'ਘੱਟੋ-ਘੱਟ ਸਟਾਕ',
    'supplier': 'ਸਪਲਾਇਰ',
    'batch-number': 'ਬੈਚ ਨੰਬਰ',
    'expiry-date': 'ਮਿਆਦ ਪੁੱਗਣ ਦੀ ਤਾਰੀਖ',
    'auto-ordered': 'ਆਟੋ ਆਰਡਰ',
    'manual-order': 'ਮੈਨੁਅਲ ਆਰਡਰ',
    'acknowledge': 'ਸਵੀਕਾਰ ਕਰੋ',
    
    // Admin Dashboard
    'admin-dashboard': 'ਐਡਮਿਨ ਡੈਸ਼ਬੋਰਡ',
    'user-management': 'ਯੂਜ਼ਰ ਪ੍ਰਬੰਧਨ',
    'system-analytics': 'ਸਿਸਟਮ ਐਨਾਲਿਟਿਕਸ',
    'audit-logs': 'ਆਡਿਟ ਲਾਗ',
    'government-reports': 'ਸਰਕਾਰੀ ਰਿਪੋਰਟ',
    'system-settings': 'ਸਿਸਟਮ ਸੈਟਿੰਗ',
    'security-settings': 'ਸੁਰੱਖਿਆ ਸੈਟਿੰਗ',
    'backup-frequency': 'ਬੈਕਅਪ ਫ੍ਰੀਕੁਐਂਸੀ',
    'session-timeout': 'ਸੈਸ਼ਨ ਟਾਈਮਆਉਟ',
    'password-policy': 'ਪਾਸਵਰਡ ਪਾਲਿਸੀ',
    'maintenance-mode': 'ਰੱਖ-ਰਖਾਅ ਮੋਡ',
    
    // Analytics
    'analytics-dashboard': 'ਐਨਾਲਿਟਿਕਸ ਡੈਸ਼ਬੋਰਡ',
    'disease-patterns': 'ਰੋਗ ਪੈਟਰਨ',
    'medicine-usage': 'ਦਵਾਈ ਵਰਤੋਂ',
    'appointment-trends': 'ਅਪਾਇੰਟਮੈਂਟ ਟ੍ਰੈਂਡ',
    'regional-data': 'ਖੇਤਰੀ ਡੇਟਾ',
    'user-growth': 'ਯੂਜ਼ਰ ਵਾਧਾ',
    'total-users': 'ਕੁੱਲ ਯੂਜ਼ਰ',
    'active-doctors': 'ਸਰਗਰਮ ਡਾਕਟਰ',
    'total-appointments': 'ਕੁੱਲ ਅਪਾਇੰਟਮੈਂਟ',
    'completed-consultations': 'ਪੂਰੇ ਸਲਾਹ',
    'medicine-shortages': 'ਦਵਾਈ ਦੀ ਕਮੀ',
    'revenue': 'ਰੈਵਨਿਊ',
    'export-report': 'ਰਿਪੋਰਟ ਐਕਸਪੋਰਟ ਕਰੋ',
    'generate-report': 'ਰਿਪੋਰਟ ਜਨਰੇਟ ਕਰੋ',
    
    // Common Actions
    'save': 'ਸੇਵ ਕਰੋ',
    'cancel': 'ਰੱਦ ਕਰੋ',
    'delete': 'ਹਟਾਓ',
    'edit': 'ਸੰਪਾਦਨ ਕਰੋ',
    'add': 'ਜੋੜੋ',
    'remove': 'ਹਟਾਓ',
    'search': 'ਖੋਜੋ',
    'filter': 'ਫਿਲਟਰ ਕਰੋ',
    'refresh': 'ਰਿਫਰੈਸ਼ ਕਰੋ',
    'export': 'ਐਕਸਪੋਰਟ ਕਰੋ',
    'import': 'ਇੰਪੋਰਟ ਕਰੋ',
    'download': 'ਡਾਊਨਲੋਡ ਕਰੋ',
    'upload': 'ਅਪਲੋਡ ਕਰੋ',
    'submit': 'ਜਮ੍ਹਾ ਕਰੋ',
    'reset': 'ਰੀਸੈਟ ਕਰੋ',
    'confirm': 'ਪੁਸ਼ਟੀ ਕਰੋ',
    'back': 'ਵਾਪਸ',
    'next': 'ਅਗਲਾ',
    'previous': 'ਪਿਛਲਾ',
    'close': 'ਬੰਦ ਕਰੋ',
    'open': 'ਖੋਲ੍ਹੋ',
    'loading': 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ',
    'error': 'ਗਲਤੀ',
    'success': 'ਸਫਲਤਾ',
    'warning': 'ਚੇਤਾਵਨੀ',
    'info': 'ਜਾਣਕਾਰੀ',
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
    
    // Pharmacist Dashboard
    'pharmacist-dashboard': 'Pharmacist Dashboard',
    'medicine-stock': 'Medicine Stock',
    'stock-management': 'Stock Management',
    'prescription-processing': 'Prescription Processing',
    'stock-alerts': 'Stock Alerts',
    'reorder-needed': 'Reorder Needed',
    'scan-qr-code': 'Scan QR Code',
    'add-medicine': 'Add Medicine',
    'update-stock': 'Update Stock',
    'current-stock': 'Current Stock',
    'minimum-stock': 'Minimum Stock',
    'supplier': 'Supplier',
    'batch-number': 'Batch Number',
    'expiry-date': 'Expiry Date',
    'auto-ordered': 'Auto Ordered',
    'manual-order': 'Manual Order',
    'acknowledge': 'Acknowledge',
    
    // Admin Dashboard
    'admin-dashboard': 'Admin Dashboard',
    'user-management': 'User Management',
    'system-analytics': 'System Analytics',
    'audit-logs': 'Audit Logs',
    'government-reports': 'Government Reports',
    'system-settings': 'System Settings',
    'security-settings': 'Security Settings',
    'backup-frequency': 'Backup Frequency',
    'session-timeout': 'Session Timeout',
    'password-policy': 'Password Policy',
    'maintenance-mode': 'Maintenance Mode',
    
    // Analytics
    'analytics-dashboard': 'Analytics Dashboard',
    'disease-patterns': 'Disease Patterns',
    'medicine-usage': 'Medicine Usage',
    'appointment-trends': 'Appointment Trends',
    'regional-data': 'Regional Data',
    'user-growth': 'User Growth',
    'total-users': 'Total Users',
    'active-doctors': 'Active Doctors',
    'total-appointments': 'Total Appointments',
    'completed-consultations': 'Completed Consultations',
    'medicine-shortages': 'Medicine Shortages',
    'revenue': 'Revenue',
    'export-report': 'Export Report',
    'generate-report': 'Generate Report',
    
    // Common Actions
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'remove': 'Remove',
    'search': 'Search',
    'filter': 'Filter',
    'refresh': 'Refresh',
    'export': 'Export',
    'import': 'Import',
    'download': 'Download',
    'upload': 'Upload',
    'submit': 'Submit',
    'reset': 'Reset',
    'confirm': 'Confirm',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    'close': 'Close',
    'open': 'Open',
    'loading': 'Loading',
    'error': 'Error',
    'success': 'Success',
    'warning': 'Warning',
    'info': 'Info',
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
    return (translations[language] as any)[key] || key;
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
