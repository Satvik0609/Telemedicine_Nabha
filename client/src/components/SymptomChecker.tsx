import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { auth } from '@/lib/firebase';
import { offlineAI } from '@/lib/offlineAI';
import { offlineStorage } from '@/lib/offlineStorage';
import { useToast } from '@/hooks/use-toast';

export function SymptomChecker() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Use demo user if Firebase is not configured and no user is authenticated
  const currentUser = user || (!auth ? {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'patient' as const
  } : null);

  const addSymptom = () => {
    if (currentSymptom.trim() && !symptoms.includes(currentSymptom.trim())) {
      setSymptoms([...symptoms, currentSymptom.trim()]);
      setCurrentSymptom('');
      setSuggestions([]);
    }
  };

  const handleSymptomInput = (value: string) => {
    setCurrentSymptom(value);
    if (value.length > 1) {
      const newSuggestions = offlineAI.getSymptomSuggestions(value, language);
      setSuggestions(newSuggestions.slice(0, 5)); // Show top 5 suggestions
    } else {
      setSuggestions([]);
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const analyzeSymptom = async () => {
    if (symptoms.length === 0 || !currentUser) {
      toast({
        title: "Error",
        description: "Please add at least one symptom to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Use offline AI for analysis
        const analysis = await offlineAI.analyzeSymptoms(symptoms, language);
      
      // Save to offline storage
      const symptomCheck = {
        id: `temp-${Date.now()}`,
        patientId: currentUser.id,
        symptoms,
        aiResponse: analysis,
        severity: analysis.severity,
        createdAt: new Date()
      };
      
      await offlineStorage.saveSymptomCheck(symptomCheck);
      setResult(analysis);
      
      toast({
        title: "Analysis Complete",
        description: "Your symptoms have been analyzed successfully using offline AI.",
      });
    } catch (error) {
      console.error('Symptom analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze symptoms. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearSymptoms = () => {
    setSymptoms([]);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-stethoscope mr-2 text-secondary"></i>
            {t('symptom-checker')} - AI Powered
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter a symptom (e.g., fever, headache, cough)"
                value={currentSymptom}
                onChange={(e) => handleSymptomInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                data-testid="input-symptom"
              />
              <Button onClick={addSymptom} data-testid="button-add-symptom">
                Add
              </Button>
            </div>
            
            {suggestions.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Suggestions:</p>
                <div className="flex flex-wrap gap-1">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentSymptom(suggestion);
                        setSuggestions([]);
                      }}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {symptoms.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Current Symptoms:</h4>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => removeSymptom(symptom)}
                    data-testid={`badge-symptom-${index}`}
                  >
                    {symptom} <i className="fas fa-times ml-1"></i>
                  </Badge>
                ))}
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  onClick={analyzeSymptom} 
                  disabled={isAnalyzing}
                  data-testid="button-analyze-symptoms"
                >
                  {isAnalyzing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-robot mr-2"></i>
                      Analyze Symptoms
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={clearSymptoms} data-testid="button-clear-symptoms">
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              AI Analysis Results
              <Badge 
                className={`${
                  result.severity === 'emergency' ? 'bg-red-100 text-red-800' :
                  result.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  result.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}
                data-testid="badge-severity"
              >
                {result.severity.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Possible Conditions:</h4>
              <ul className="list-disc list-inside space-y-1" data-testid="list-conditions">
                      {result.possibleConditions.map((condition: string, index: number) => (
                  <li key={index} className="text-sm">{condition}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recommendations:</h4>
              <ul className="list-disc list-inside space-y-1" data-testid="list-recommendations">
                      {result.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="text-sm">{recommendation}</li>
                ))}
              </ul>
            </div>

            {result.urgency === 'emergency' && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle text-red-600 mr-2"></i>
                  <span className="font-medium text-red-800">Emergency Alert</span>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  Your symptoms may require immediate medical attention. Please contact emergency services or visit the nearest hospital.
                </p>
                <Button 
                  variant="destructive" 
                  className="mt-2" 
                  onClick={() => window.open('tel:108', '_self')}
                  data-testid="button-emergency-call"
                >
                  <i className="fas fa-phone mr-2"></i>
                  Call 108 - Emergency
                </Button>
              </div>
            )}

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <i className="fas fa-info-circle mr-1"></i>
                {result.disclaimer}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
