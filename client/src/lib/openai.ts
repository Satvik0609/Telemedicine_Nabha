// Client-side OpenAI functionality will be handled through backend API calls
// This file provides types and utilities for symptom checking

export interface SymptomCheckResponse {
  possibleConditions: string[];
  severity: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: string[];
  urgency: 'routine' | 'urgent' | 'emergency';
  disclaimer: string;
}

export interface SymptomCheck {
  id: string;
  patientId: string;
  symptoms: string[];
  aiResponse: SymptomCheckResponse;
  severity: 'low' | 'medium' | 'high' | 'emergency';
  createdAt: string;
}

export async function analyzeSymptoms(symptoms: string[], patientId: string): Promise<SymptomCheck> {
  const response = await fetch('/api/symptom-check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ symptoms, patientId }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze symptoms');
  }

  return response.json();
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'low':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    case 'high':
      return 'text-orange-600';
    case 'emergency':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

export function getSeverityBgColor(severity: string): string {
  switch (severity) {
    case 'low':
      return 'bg-green-100';
    case 'medium':
      return 'bg-yellow-100';
    case 'high':
      return 'bg-orange-100';
    case 'emergency':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
}
