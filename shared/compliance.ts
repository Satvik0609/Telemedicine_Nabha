/**
 * Healthcare Compliance and Security Configuration
 * Implements standards for HIPAA, GDPR, HL7 FHIR, and Indian healthcare regulations
 */

import { z } from 'zod';

// Compliance Framework Configuration
export const COMPLIANCE_CONFIG = {
  // HIPAA (Health Insurance Portability and Accountability Act)
  HIPAA: {
    ADMINISTRATIVE_SAFEGUARDS: {
      SECURITY_OFFICER: 'Required',
      WORKFORCE_TRAINING: 'Required',
      ACCESS_MANAGEMENT: 'Required',
      INFORMATION_ACCESS_MANAGEMENT: 'Required',
      SECURITY_AWARENESS: 'Required',
      SECURITY_INCIDENT_PROCEDURES: 'Required',
      CONTINGENCY_PLAN: 'Required',
      EVALUATION: 'Required',
      BUSINESS_ASSOCIATE_AGREEMENTS: 'Required',
    },
    PHYSICAL_SAFEGUARDS: {
      FACILITY_ACCESS_CONTROLS: 'Required',
      WORKSTATION_USE: 'Required',
      WORKSTATION_SECURITY: 'Required',
      DEVICE_AND_MEDIA_CONTROLS: 'Required',
    },
    TECHNICAL_SAFEGUARDS: {
      ACCESS_CONTROL: 'Required',
      AUDIT_CONTROLS: 'Required',
      INTEGRITY: 'Required',
      PERSON_OR_ENTITY_AUTHENTICATION: 'Required',
      TRANSMISSION_SECURITY: 'Required',
    },
    BREACH_NOTIFICATION: {
      TIMEFRAME: '60 days',
      THRESHOLD: '500+ individuals',
      REQUIREMENTS: ['Individual notification', 'Media notification', 'HHS notification'],
    },
  },

  // GDPR (General Data Protection Regulation)
  GDPR: {
    DATA_PROTECTION_PRINCIPLES: {
      LAWFULNESS: 'Required',
      FAIRNESS: 'Required',
      TRANSPARENCY: 'Required',
      PURPOSE_LIMITATION: 'Required',
      DATA_MINIMISATION: 'Required',
      ACCURACY: 'Required',
      STORAGE_LIMITATION: 'Required',
      INTEGRITY_AND_CONFIDENTIALITY: 'Required',
    },
    INDIVIDUAL_RIGHTS: {
      RIGHT_TO_INFORMATION: 'Required',
      RIGHT_OF_ACCESS: 'Required',
      RIGHT_TO_RECTIFICATION: 'Required',
      RIGHT_TO_ERASURE: 'Required',
      RIGHT_TO_RESTRICT_PROCESSING: 'Required',
      RIGHT_TO_DATA_PORTABILITY: 'Required',
      RIGHT_TO_OBJECT: 'Required',
      RIGHTS_RELATING_TO_AUTOMATED_DECISION_MAKING: 'Required',
    },
    CONSENT_REQUIREMENTS: {
      EXPLICIT_CONSENT: 'Required for health data',
      WITHDRAWABLE: 'Required',
      GRANULAR: 'Required',
      INFORMED: 'Required',
    },
    DATA_PROTECTION_IMPACT_ASSESSMENT: {
      HIGH_RISK_PROCESSING: 'Required',
      SYSTEMATIC_MONITORING: 'Required',
      LARGE_SCALE_PROCESSING: 'Required',
    },
  },

  // HL7 FHIR (Fast Healthcare Interoperability Resources)
  FHIR: {
    RESOURCE_STANDARDS: {
      PATIENT: 'R4 Patient Resource',
      PRACTITIONER: 'R4 Practitioner Resource',
      APPOINTMENT: 'R4 Appointment Resource',
      OBSERVATION: 'R4 Observation Resource',
      MEDICATION: 'R4 Medication Resource',
      BUNDLE: 'R4 Bundle Resource',
    },
    CODING_SYSTEMS: {
      SNOMED_CT: 'Required for clinical terms',
      LOINC: 'Required for laboratory data',
      ICD_10: 'Required for diagnoses',
      CPT: 'Required for procedures',
      NDC: 'Required for medications',
    },
    SECURITY_PROFILES: {
      SMART_ON_FHIR: 'Required for OAuth2',
      OAUTH2: 'Required for authentication',
      JWT: 'Required for tokens',
      TLS: 'Required for transport',
    },
  },

  // Indian Healthcare Regulations
  INDIAN_HEALTHCARE: {
    DIGITAL_HEALTH_GUIDELINES: {
      DATA_LOCALIZATION: 'Required for sensitive data',
      CONSENT_MANAGEMENT: 'Required',
      DATA_RETENTION: '7 years minimum',
      BREACH_NOTIFICATION: '72 hours',
    },
    TELEMEDICINE_GUIDELINES: {
      REGISTRATION: 'Required for practitioners',
      PRESCRIPTION_VALIDITY: 'Digital signatures required',
      CONSULTATION_RECORDS: 'Mandatory maintenance',
      EMERGENCY_PROTOCOLS: 'Required',
    },
    PHARMACY_REGULATIONS: {
      DRUG_LICENSE: 'Required',
      PRESCRIPTION_VALIDATION: 'Required',
      INVENTORY_MANAGEMENT: 'Required',
      ADVERSE_EVENT_REPORTING: 'Required',
    },
  },
} as const;

// Data Classification Schema
export const DataClassificationSchema = z.object({
  level: z.enum(['public', 'internal', 'confidential', 'restricted']),
  category: z.enum(['PII', 'PHI', 'financial', 'operational', 'research']),
  sensitivity: z.enum(['low', 'medium', 'high', 'critical']),
  retentionPeriod: z.number().min(1).max(2555), // 1 day to 7 years
  encryptionRequired: z.boolean(),
  accessControls: z.array(z.string()),
  complianceFrameworks: z.array(z.string()),
});

export type DataClassification = z.infer<typeof DataClassificationSchema>;

// Audit Event Schema
export const AuditEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  outcome: z.enum(['success', 'failure', 'partial']),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  complianceFlags: z.array(z.string()),
  dataClassification: z.string(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

// Consent Management Schema
export const ConsentSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string(),
  purpose: z.string(),
  dataTypes: z.array(z.string()),
  granted: z.boolean(),
  timestamp: z.string().datetime(),
  expiryDate: z.string().datetime().optional(),
  withdrawalDate: z.string().datetime().optional(),
  legalBasis: z.enum(['consent', 'legitimate_interest', 'vital_interest', 'public_task']),
  consentMethod: z.enum(['explicit', 'opt_in', 'opt_out']),
  evidence: z.string().optional(), // Digital signature or proof
});

export type Consent = z.infer<typeof ConsentSchema>;

// Data Processing Agreement Schema
export const DataProcessingAgreementSchema = z.object({
  id: z.string().uuid(),
  processorId: z.string(),
  controllerId: z.string(),
  purpose: z.string(),
  dataTypes: z.array(z.string()),
  processingActivities: z.array(z.string()),
  technicalMeasures: z.array(z.string()),
  organizationalMeasures: z.array(z.string()),
  subProcessors: z.array(z.string()).optional(),
  dataLocation: z.string(),
  retentionPeriod: z.number(),
  securityIncidentNotification: z.boolean(),
  auditRights: z.boolean(),
  terminationClause: z.string(),
  effectiveDate: z.string().datetime(),
  expiryDate: z.string().datetime().optional(),
});

export type DataProcessingAgreement = z.infer<typeof DataProcessingAgreementSchema>;

// Compliance Check Schema
export const ComplianceCheckSchema = z.object({
  id: z.string().uuid(),
  framework: z.enum(['HIPAA', 'GDPR', 'HL7_FHIR', 'INDIAN_HEALTHCARE']),
  checkType: z.enum(['automated', 'manual', 'audit']),
  status: z.enum(['pass', 'fail', 'warning', 'not_applicable']),
  findings: z.array(z.object({
    requirement: z.string(),
    status: z.enum(['compliant', 'non_compliant', 'partially_compliant']),
    evidence: z.string().optional(),
    recommendations: z.array(z.string()).optional(),
  })),
  timestamp: z.string().datetime(),
  assessor: z.string().optional(),
  nextReviewDate: z.string().datetime().optional(),
});

export type ComplianceCheck = z.infer<typeof ComplianceCheckSchema>;

// Security Incident Schema
export const SecurityIncidentSchema = z.object({
  id: z.string().uuid(),
  incidentType: z.enum(['data_breach', 'unauthorized_access', 'system_compromise', 'malware', 'phishing', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['reported', 'investigating', 'contained', 'resolved', 'closed']),
  description: z.string(),
  affectedData: z.array(z.string()),
  affectedUsers: z.number().optional(),
  discoveryDate: z.string().datetime(),
  containmentDate: z.string().datetime().optional(),
  resolutionDate: z.string().datetime().optional(),
  rootCause: z.string().optional(),
  remediationActions: z.array(z.string()),
  notificationRequired: z.boolean(),
  notificationDate: z.string().datetime().optional(),
  regulatoryReporting: z.object({
    required: z.boolean(),
    frameworks: z.array(z.string()),
    reportingDate: z.string().datetime().optional(),
    reportReference: z.string().optional(),
  }),
});

export type SecurityIncident = z.infer<typeof SecurityIncidentSchema>;

// Compliance Reporting Schema
export const ComplianceReportSchema = z.object({
  id: z.string().uuid(),
  reportType: z.enum(['quarterly', 'annual', 'incident', 'audit', 'assessment']),
  framework: z.enum(['HIPAA', 'GDPR', 'HL7_FHIR', 'INDIAN_HEALTHCARE']),
  period: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
  summary: z.object({
    totalIncidents: z.number(),
    resolvedIncidents: z.number(),
    openIncidents: z.number(),
    complianceScore: z.number().min(0).max(100),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  }),
  findings: z.array(z.object({
    category: z.string(),
    status: z.enum(['compliant', 'non_compliant', 'partially_compliant']),
    description: z.string(),
    recommendations: z.array(z.string()),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
  })),
  actionItems: z.array(z.object({
    description: z.string(),
    owner: z.string(),
    dueDate: z.string().datetime(),
    status: z.enum(['pending', 'in_progress', 'completed', 'overdue']),
  })),
  generatedDate: z.string().datetime(),
  generatedBy: z.string(),
});

export type ComplianceReport = z.infer<typeof ComplianceReportSchema>;

// Export compliance utilities
export const ComplianceUtils = {
  // Check if data processing is compliant
  isDataProcessingCompliant: (data: any, framework: string, purpose: string): boolean => {
    // Simplified compliance check
    switch (framework) {
      case 'HIPAA':
        return data && typeof data === 'object' && 'patientId' in data;
      case 'GDPR':
        return data && typeof data === 'object' && 'consent' in data;
      case 'HL7_FHIR':
        return data && typeof data === 'object' && 'resourceType' in data;
      default:
        return true;
    }
  },

  // Generate compliance report
  generateComplianceReport: (framework: string, period: { start: string; end: string }) => {
    return {
      framework,
      period,
      complianceScore: 85, // Mock score
      status: 'compliant',
      findings: [],
      recommendations: [],
    };
  },

  // Check data retention compliance
  isDataRetentionCompliant: (dataAge: number, classification: string): boolean => {
    const retentionPeriods = {
      'public': 365, // 1 year
      'internal': 1095, // 3 years
      'confidential': 1825, // 5 years
      'restricted': 2555, // 7 years
    };
    
    return dataAge <= (retentionPeriods[classification as keyof typeof retentionPeriods] || 2555);
  },

  // Validate consent
  isConsentValid: (consent: Consent): boolean => {
    if (!consent.granted) return false;
    if (consent.withdrawalDate) return false;
    if (consent.expiryDate && new Date(consent.expiryDate) < new Date()) return false;
    return true;
  },
};
