// Offline AI Symptom Checker using TensorFlow Lite
// This is a simplified implementation that would integrate with TensorFlow Lite in a real app

interface SymptomAnalysis {
  possibleConditions: string[];
  severity: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: string[];
  urgency: 'routine' | 'urgent' | 'emergency';
  confidence: number;
  disclaimer: string;
}

interface SymptomPattern {
  symptoms: string[];
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: string[];
  confidence: number;
}

// Offline symptom patterns database (simplified)
const OFFLINE_SYMPTOM_PATTERNS: SymptomPattern[] = [
  {
    symptoms: ['fever', 'headache', 'body ache', 'fatigue'],
    condition: 'Viral Fever',
    severity: 'medium',
    recommendations: [
      'Rest and stay hydrated',
      'Take paracetamol for fever',
      'Monitor temperature regularly',
      'Consult doctor if fever persists for more than 3 days'
    ],
    confidence: 0.85
  },
  {
    symptoms: ['chest pain', 'shortness of breath', 'sweating'],
    condition: 'Cardiac Event',
    severity: 'emergency',
    recommendations: [
      'Seek immediate medical attention',
      'Call emergency services (108)',
      'Do not delay medical care',
      'Have someone accompany you to hospital'
    ],
    confidence: 0.95
  },
  {
    symptoms: ['cough', 'sore throat', 'runny nose'],
    condition: 'Common Cold',
    severity: 'low',
    recommendations: [
      'Rest and stay hydrated',
      'Gargle with warm salt water',
      'Use throat lozenges',
      'Consult doctor if symptoms worsen'
    ],
    confidence: 0.80
  },
  {
    symptoms: ['nausea', 'vomiting', 'diarrhea', 'stomach pain'],
    condition: 'Gastroenteritis',
    severity: 'medium',
    recommendations: [
      'Stay hydrated with oral rehydration solution',
      'Avoid solid foods initially',
      'Rest and avoid dairy products',
      'Consult doctor if symptoms persist'
    ],
    confidence: 0.75
  },
  {
    symptoms: ['severe headache', 'nausea', 'light sensitivity'],
    condition: 'Migraine',
    severity: 'medium',
    recommendations: [
      'Rest in a dark, quiet room',
      'Apply cold compress to head',
      'Take prescribed migraine medication',
      'Consult doctor for preventive treatment'
    ],
    confidence: 0.70
  },
  {
    symptoms: ['high fever', 'severe headache', 'neck stiffness'],
    condition: 'Meningitis',
    severity: 'emergency',
    recommendations: [
      'Seek immediate medical attention',
      'Call emergency services',
      'Do not delay medical care',
      'This is a medical emergency'
    ],
    confidence: 0.90
  },
  {
    symptoms: ['frequent urination', 'excessive thirst', 'weight loss'],
    condition: 'Diabetes',
    severity: 'high',
    recommendations: [
      'Consult doctor immediately',
      'Monitor blood sugar levels',
      'Follow diabetic diet',
      'Regular medical checkups needed'
    ],
    confidence: 0.85
  },
  {
    symptoms: ['chest pain', 'cough', 'blood in sputum'],
    condition: 'Respiratory Infection',
    severity: 'high',
    recommendations: [
      'Consult doctor immediately',
      'Avoid smoking and pollution',
      'Rest and stay hydrated',
      'Monitor symptoms closely'
    ],
    confidence: 0.80
  }
];

// Multilingual symptom mapping
const SYMPTOM_TRANSLATIONS = {
  hi: {
    'fever': 'बुखार',
    'headache': 'सिरदर्द',
    'cough': 'खांसी',
    'sore throat': 'गले में दर्द',
    'nausea': 'मतली',
    'vomiting': 'उल्टी',
    'diarrhea': 'दस्त',
    'stomach pain': 'पेट दर्द',
    'chest pain': 'छाती में दर्द',
    'shortness of breath': 'सांस लेने में तकलीफ',
    'fatigue': 'थकान',
    'body ache': 'शरीर में दर्द',
    'runny nose': 'नाक बहना',
    'sweating': 'पसीना आना',
    'light sensitivity': 'प्रकाश के प्रति संवेदनशीलता',
    'neck stiffness': 'गर्दन में अकड़न',
    'frequent urination': 'बार-बार पेशाब आना',
    'excessive thirst': 'अत्यधिक प्यास',
    'weight loss': 'वजन कम होना',
    'blood in sputum': 'बलगम में खून'
  },
  pa: {
    'fever': 'ਬੁਖਾਰ',
    'headache': 'ਸਿਰ ਦਰਦ',
    'cough': 'ਖੰਘ',
    'sore throat': 'ਗਲੇ ਵਿੱਚ ਦਰਦ',
    'nausea': 'ਮਤਲੀ',
    'vomiting': 'ਉਲਟੀ',
    'diarrhea': 'ਦਸਤ',
    'stomach pain': 'ਪੇਟ ਦਰਦ',
    'chest pain': 'ਛਾਤੀ ਵਿੱਚ ਦਰਦ',
    'shortness of breath': 'ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ',
    'fatigue': 'ਥਕਾਵਟ',
    'body ache': 'ਸਰੀਰ ਵਿੱਚ ਦਰਦ',
    'runny nose': 'ਨੱਕ ਵਹਿਣਾ',
    'sweating': 'ਪਸੀਨਾ ਆਉਣਾ',
    'light sensitivity': 'ਰੋਸ਼ਨੀ ਪ੍ਰਤੀ ਸੰਵੇਦਨਸ਼ੀਲਤਾ',
    'neck stiffness': 'ਗਰਦਨ ਵਿੱਚ ਅਕੜਨ',
    'frequent urination': 'ਬਾਰ-ਬਾਰ ਪਿਸ਼ਾਬ ਆਉਣਾ',
    'excessive thirst': 'ਜ਼ਿਆਦਾ ਪਿਆਸ',
    'weight loss': 'ਵਜ਼ਨ ਘਟਣਾ',
    'blood in sputum': 'ਬਲਗਮ ਵਿੱਚ ਖੂਨ'
  },
  en: {
    'fever': 'fever',
    'headache': 'headache',
    'cough': 'cough',
    'sore throat': 'sore throat',
    'nausea': 'nausea',
    'vomiting': 'vomiting',
    'diarrhea': 'diarrhea',
    'stomach pain': 'stomach pain',
    'chest pain': 'chest pain',
    'shortness of breath': 'shortness of breath',
    'fatigue': 'fatigue',
    'body ache': 'body ache',
    'runny nose': 'runny nose',
    'sweating': 'sweating',
    'light sensitivity': 'light sensitivity',
    'neck stiffness': 'neck stiffness',
    'frequent urination': 'frequent urination',
    'excessive thirst': 'excessive thirst',
    'weight loss': 'weight loss',
    'blood in sputum': 'blood in sputum'
  }
};

class OfflineAIService {
  private isInitialized = false;
  private model: any = null; // TensorFlow Lite model would be loaded here

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // In a real implementation, this would load a TensorFlow Lite model
      // For now, we'll use the pattern matching approach
      console.log('Offline AI initialized with pattern matching');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize offline AI:', error);
      throw error;
    }
  }

  async analyzeSymptoms(
    symptoms: string[], 
    language: 'hi' | 'pa' | 'en' = 'en'
  ): Promise<SymptomAnalysis> {
    await this.initialize();

    // Normalize symptoms to English
    const normalizedSymptoms = symptoms.map(symptom => 
      this.normalizeSymptom(symptom, language)
    );

    // Find matching patterns
    const matches = this.findMatchingPatterns(normalizedSymptoms);
    
    if (matches.length === 0) {
      return this.getDefaultAnalysis(symptoms);
    }

    // Get the best match
    const bestMatch = matches[0];
    
    return {
      possibleConditions: [bestMatch.condition],
      severity: bestMatch.severity,
      recommendations: bestMatch.recommendations,
      urgency: this.getUrgencyFromSeverity(bestMatch.severity),
      confidence: bestMatch.confidence,
      disclaimer: this.getDisclaimer(language)
    };
  }

  private normalizeSymptom(symptom: string, language: 'hi' | 'pa' | 'en'): string {
    const translations = SYMPTOM_TRANSLATIONS[language];
    
    // Find English equivalent
    for (const [english, translated] of Object.entries(translations)) {
      if (translated.toLowerCase() === symptom.toLowerCase()) {
        return english;
      }
    }
    
    // If not found in translations, return as is (assuming it's already in English)
    return symptom.toLowerCase();
  }

  private findMatchingPatterns(symptoms: string[]): SymptomPattern[] {
    const matches: SymptomPattern[] = [];
    
    for (const pattern of OFFLINE_SYMPTOM_PATTERNS) {
      const matchScore = this.calculateMatchScore(symptoms, pattern.symptoms);
      
      if (matchScore > 0.3) { // Minimum threshold
        matches.push({
          ...pattern,
          confidence: matchScore
        });
      }
    }
    
    // Sort by confidence score
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  private calculateMatchScore(userSymptoms: string[], patternSymptoms: string[]): number {
    const userSet = new Set(userSymptoms);
    const patternSet = new Set(patternSymptoms);
    
    // Calculate Jaccard similarity
    const intersection = new Set([...userSet].filter(x => patternSet.has(x)));
    const union = new Set([...userSet, ...patternSet]);
    
    return intersection.size / union.size;
  }

  private getUrgencyFromSeverity(severity: string): 'routine' | 'urgent' | 'emergency' {
    switch (severity) {
      case 'emergency': return 'emergency';
      case 'high': return 'urgent';
      case 'medium': return 'routine';
      case 'low': return 'routine';
      default: return 'routine';
    }
  }

  private getDefaultAnalysis(symptoms: string[]): SymptomAnalysis {
    return {
      possibleConditions: ['General health assessment needed'],
      severity: 'low',
      recommendations: [
        'Monitor your symptoms closely',
        'Stay hydrated and get adequate rest',
        'Consult with a healthcare professional if symptoms persist'
      ],
      urgency: 'routine',
      confidence: 0.3,
      disclaimer: 'This is a preliminary assessment. Please consult with a qualified healthcare professional for proper diagnosis and treatment.'
    };
  }

  private getDisclaimer(language: 'hi' | 'pa' | 'en'): string {
    const disclaimers = {
      hi: 'यह एक प्रारंभिक आकलन है। उचित निदान और उपचार के लिए कृपया एक योग्य स्वास्थ्य पेशेवर से परामर्श करें।',
      pa: 'ਇਹ ਇੱਕ ਪ੍ਰਾਥਮਿਕ ਮੁਲਾਂਕਣ ਹੈ। ਉਚਿਤ ਨਿਦਾਨ ਅਤੇ ਇਲਾਜ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਯੋਗ ਸਿਹਤ ਪੇਸ਼ੇਵਰ ਨਾਲ ਸਲਾਹ ਲਓ।',
      en: 'This is a preliminary assessment. Please consult with a qualified healthcare professional for proper diagnosis and treatment.'
    };
    
    return disclaimers[language];
  }

  // Get available symptoms for autocomplete
  getAvailableSymptoms(language: 'hi' | 'pa' | 'en' = 'en'): string[] {
    const translations = SYMPTOM_TRANSLATIONS[language];
    return Object.values(translations);
  }

  // Get symptom suggestions based on partial input
  getSymptomSuggestions(partial: string, language: 'hi' | 'pa' | 'en' = 'en'): string[] {
    const availableSymptoms = this.getAvailableSymptoms(language);
    return availableSymptoms.filter(symptom => 
      symptom.toLowerCase().includes(partial.toLowerCase())
    );
  }
}

export const offlineAI = new OfflineAIService();

// Initialize offline AI when the app starts
if (typeof window !== 'undefined') {
  offlineAI.initialize().catch(console.error);
}
