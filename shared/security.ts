/**
 * Security and Compliance Utilities for SehatSetu
 * Implements encryption, audit logging, and healthcare compliance measures
 */

import { z } from 'zod';
import crypto from 'crypto';

// Security Configuration
export const SECURITY_CONFIG = {
  // Encryption settings
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  KEY_DERIVATION_ITERATIONS: 100000,
  SALT_LENGTH: 32,
  IV_LENGTH: 16,
  TAG_LENGTH: 16,
  
  // JWT settings
  JWT_EXPIRY: '24h',
  JWT_REFRESH_EXPIRY: '7d',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Session settings
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  
  // Audit settings
  AUDIT_RETENTION_DAYS: 2555, // 7 years (healthcare compliance)
  AUDIT_BATCH_SIZE: 1000,
  
  // Data classification levels
  DATA_CLASSIFICATION: {
    PUBLIC: 'public',
    INTERNAL: 'internal',
    CONFIDENTIAL: 'confidential',
    RESTRICTED: 'restricted',
  },
  
  // Healthcare-specific compliance
  COMPLIANCE_FRAMEWORKS: {
    HIPAA: 'hipaa',
    GDPR: 'gdpr',
    INDIAN_HEALTHCARE: 'indian_healthcare',
    HL7_FHIR: 'hl7_fhir',
  },
} as const;

// Audit Log Schema
export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
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
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  complianceFlags: z.array(z.string()).default([]),
  dataClassification: z.enum(['public', 'internal', 'confidential', 'restricted']).default('internal'),
  retentionPeriod: z.number().default(SECURITY_CONFIG.AUDIT_RETENTION_DAYS),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

// Encryption Utilities
export class EncryptionService {
  private static instance: EncryptionService;
  private masterKey: Buffer;

  private constructor() {
    // In production, this should come from secure key management
    this.masterKey = crypto.scryptSync(
      process.env.MASTER_ENCRYPTION_KEY || 'default-key-change-in-production',
      'sehatsetu-salt',
      32
    );
  }

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Encrypt sensitive data (PII, PHI)
   */
  encrypt(data: string, dataClassification: string = 'confidential'): string {
    const iv = crypto.randomBytes(SECURITY_CONFIG.IV_LENGTH);
    const cipher = crypto.createCipher(SECURITY_CONFIG.ENCRYPTION_ALGORITHM, this.masterKey);
    cipher.setAAD(Buffer.from(dataClassification));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      algorithm: SECURITY_CONFIG.ENCRYPTION_ALGORITHM,
      classification: dataClassification,
    });
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    const { encrypted, iv, tag, algorithm, classification } = JSON.parse(encryptedData);
    
    const decipher = crypto.createDecipher(algorithm, this.masterKey);
    decipher.setAAD(Buffer.from(classification));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash sensitive data (one-way)
   */
  hash(data: string, salt?: string): { hash: string; salt: string } {
    const usedSalt = salt || crypto.randomBytes(SECURITY_CONFIG.SALT_LENGTH).toString('hex');
    const hash = crypto.pbkdf2Sync(data, usedSalt, SECURITY_CONFIG.KEY_DERIVATION_ITERATIONS, 64, 'sha512');
    
    return {
      hash: hash.toString('hex'),
      salt: usedSalt,
    };
  }

  /**
   * Verify hashed data
   */
  verifyHash(data: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hash(data, salt);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate API key
   */
  generateApiKey(): string {
    const prefix = 'sk_sehatsetu_';
    const randomPart = this.generateSecureToken(32);
    return `${prefix}${randomPart}`;
  }
}

// Audit Service
export class AuditService {
  private static instance: AuditService;
  private logs: AuditLog[] = [];
  private batchSize = SECURITY_CONFIG.AUDIT_BATCH_SIZE;

  private constructor() {}

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Log security event
   */
  logEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const log: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event,
    };

    this.logs.push(log);

    // In production, this would be sent to a secure audit system
    console.log('AUDIT LOG:', JSON.stringify(log, null, 2));

    // Batch processing for performance
    if (this.logs.length >= this.batchSize) {
      this.flushLogs();
    }
  }

  /**
   * Log authentication event
   */
  logAuthEvent(
    action: 'login' | 'logout' | 'login_failed' | 'password_change' | 'account_locked' | 'token_validated' | 'session_expired',
    userId?: string,
    details?: Record<string, any>
  ): void {
    this.logEvent({
      action,
      resource: 'authentication',
      userId,
      details,
      riskLevel: action.includes('failed') || action === 'account_locked' ? 'high' : 'low',
      complianceFlags: ['HIPAA', 'GDPR'],
      dataClassification: 'confidential',
      retentionPeriod: SECURITY_CONFIG.AUDIT_RETENTION_DAYS,
    });
  }

  /**
   * Log data access event
   */
  logDataAccess(
    resource: string,
    resourceId: string,
    userId: string,
    action: 'read' | 'write' | 'delete' | 'export',
    details?: Record<string, any>
  ): void {
    this.logEvent({
      action,
      resource,
      resourceId,
      userId,
      details,
      riskLevel: action === 'delete' || action === 'export' ? 'high' : 'medium',
      complianceFlags: ['HIPAA', 'HL7_FHIR'],
      dataClassification: 'restricted',
      retentionPeriod: SECURITY_CONFIG.AUDIT_RETENTION_DAYS,
    });
  }

  /**
   * Log system event
   */
  logSystemEvent(
    action: string,
    details?: Record<string, any>,
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ): void {
    this.logEvent({
      action,
      resource: 'system',
      details,
      riskLevel,
      complianceFlags: ['HIPAA'],
      dataClassification: 'internal',
      retentionPeriod: SECURITY_CONFIG.AUDIT_RETENTION_DAYS,
    });
  }

  /**
   * Get audit logs (with filtering)
   */
  getLogs(filters?: {
    userId?: string;
    resource?: string;
    action?: string;
    riskLevel?: string;
    startDate?: string;
    endDate?: string;
  }): AuditLog[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.resource) {
        filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }
      if (filters.riskLevel) {
        filteredLogs = filteredLogs.filter(log => log.riskLevel === filters.riskLevel);
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }
    }

    return filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Flush logs to persistent storage
   */
  private flushLogs(): void {
    // In production, this would send to secure audit database
    console.log(`Flushing ${this.logs.length} audit logs to persistent storage`);
    this.logs = [];
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(
    startDate: string,
    endDate: string,
    complianceFramework: string
  ): {
    totalEvents: number;
    highRiskEvents: number;
    criticalEvents: number;
    complianceViolations: number;
    summary: Record<string, number>;
  } {
    const logs = this.getLogs({ startDate, endDate });
    
    const highRiskEvents = logs.filter(log => log.riskLevel === 'high').length;
    const criticalEvents = logs.filter(log => log.riskLevel === 'critical').length;
    const complianceViolations = logs.filter(log => 
      log.complianceFlags.includes(complianceFramework) && 
      (log.riskLevel === 'high' || log.riskLevel === 'critical')
    ).length;

    const summary = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: logs.length,
      highRiskEvents,
      criticalEvents,
      complianceViolations,
      summary,
    };
  }
}

// Data Classification Service
export class DataClassificationService {
  private static instance: DataClassificationService;

  private constructor() {}

  static getInstance(): DataClassificationService {
    if (!DataClassificationService.instance) {
      DataClassificationService.instance = new DataClassificationService();
    }
    return DataClassificationService.instance;
  }

  /**
   * Classify data based on content and context
   */
  classifyData(data: any, context?: string): string {
    // Healthcare data classification rules
    const sensitiveFields = [
      'patientId', 'patientName', 'medicalRecord', 'diagnosis', 'treatment',
      'prescription', 'labResults', 'vitalSigns', 'symptoms', 'allergies',
      'socialSecurityNumber', 'aadharNumber', 'phoneNumber', 'email',
      'address', 'dateOfBirth', 'gender', 'insuranceInfo'
    ];

    const restrictedFields = [
      'financialInfo', 'paymentDetails', 'bankAccount', 'creditCard',
      'salary', 'income', 'taxInfo'
    ];

    // Check if data contains sensitive healthcare information
    const containsSensitiveData = this.containsFields(data, sensitiveFields);
    const containsRestrictedData = this.containsFields(data, restrictedFields);

    if (containsRestrictedData) {
      return SECURITY_CONFIG.DATA_CLASSIFICATION.RESTRICTED;
    } else if (containsSensitiveData) {
      return SECURITY_CONFIG.DATA_CLASSIFICATION.CONFIDENTIAL;
    } else if (context === 'internal') {
      return SECURITY_CONFIG.DATA_CLASSIFICATION.INTERNAL;
    } else {
      return SECURITY_CONFIG.DATA_CLASSIFICATION.PUBLIC;
    }
  }

  private containsFields(data: any, fields: string[]): boolean {
    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        if (fields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          return true;
        }
        if (typeof data[key] === 'object') {
          if (this.containsFields(data[key], fields)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Apply data masking based on classification
   */
  maskData(data: any, classification: string): any {
    if (classification === SECURITY_CONFIG.DATA_CLASSIFICATION.PUBLIC) {
      return data;
    }

    if (classification === SECURITY_CONFIG.DATA_CLASSIFICATION.INTERNAL) {
      return this.maskInternalData(data);
    }

    if (classification === SECURITY_CONFIG.DATA_CLASSIFICATION.CONFIDENTIAL) {
      return this.maskConfidentialData(data);
    }

    if (classification === SECURITY_CONFIG.DATA_CLASSIFICATION.RESTRICTED) {
      return this.maskRestrictedData(data);
    }

    return data;
  }

  private maskInternalData(data: any): any {
    // Mask phone numbers and emails
    return this.maskFields(data, ['phone', 'email']);
  }

  private maskConfidentialData(data: any): any {
    // Mask PII and PHI
    return this.maskFields(data, [
      'patientName', 'patientId', 'phone', 'email', 'address',
      'dateOfBirth', 'socialSecurityNumber', 'aadharNumber'
    ]);
  }

  private maskRestrictedData(data: any): any {
    // Mask all sensitive information
    return this.maskFields(data, [
      'patientName', 'patientId', 'phone', 'email', 'address',
      'dateOfBirth', 'socialSecurityNumber', 'aadharNumber',
      'financialInfo', 'paymentDetails', 'bankAccount', 'creditCard'
    ]);
  }

  private maskFields(data: any, fields: string[]): any {
    if (typeof data === 'object' && data !== null) {
      const masked = { ...data };
      for (const key in masked) {
        if (fields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          if (typeof masked[key] === 'string') {
            masked[key] = this.maskString(masked[key]);
          }
        } else if (typeof masked[key] === 'object') {
          masked[key] = this.maskFields(masked[key], fields);
        }
      }
      return masked;
    }
    return data;
  }

  private maskString(str: string): string {
    if (str.length <= 4) {
      return '*'.repeat(str.length);
    }
    return str.substring(0, 2) + '*'.repeat(str.length - 4) + str.substring(str.length - 2);
  }
}

// Compliance Service
export class ComplianceService {
  private static instance: ComplianceService;

  private constructor() {}

  static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService();
    }
    return ComplianceService.instance;
  }

  /**
   * Validate HIPAA compliance
   */
  validateHIPAACompliance(data: any, action: string): {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check for proper encryption
    if (action === 'store' && !this.isEncrypted(data)) {
      violations.push('Data must be encrypted at rest');
      recommendations.push('Use AES-256 encryption for all PHI');
    }

    // Check for audit logging
    if (!this.hasAuditLog(action)) {
      violations.push('All PHI access must be audited');
      recommendations.push('Implement comprehensive audit logging');
    }

    // Check for access controls
    if (action === 'access' && !this.hasProperAccessControl()) {
      violations.push('Access controls must be implemented');
      recommendations.push('Implement role-based access control');
    }

    // Check for data minimization
    if (this.containsUnnecessaryData(data)) {
      violations.push('Data minimization principle violated');
      recommendations.push('Only collect necessary PHI');
    }

    return {
      compliant: violations.length === 0,
      violations,
      recommendations,
    };
  }

  /**
   * Validate GDPR compliance
   */
  validateGDPRCompliance(data: any, action: string): {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check for consent
    if (action === 'process' && !this.hasConsent(data)) {
      violations.push('Explicit consent required for data processing');
      recommendations.push('Implement consent management system');
    }

    // Check for data portability
    if (action === 'export' && !this.supportsDataPortability()) {
      violations.push('Data portability must be supported');
      recommendations.push('Implement data export functionality');
    }

    // Check for right to be forgotten
    if (action === 'delete' && !this.supportsDataDeletion()) {
      violations.push('Right to be forgotten must be supported');
      recommendations.push('Implement secure data deletion');
    }

    return {
      compliant: violations.length === 0,
      violations,
      recommendations,
    };
  }

  /**
   * Validate HL7 FHIR compliance
   */
  validateFHIRCompliance(resource: any): {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check resource type
    if (!resource.resourceType) {
      violations.push('FHIR resource must have resourceType');
      recommendations.push('Add required resourceType field');
    }

    // Check for required fields based on resource type
    if (resource.resourceType === 'Patient' && !resource.name) {
      violations.push('Patient resource must have name');
      recommendations.push('Add required name field');
    }

    if (resource.resourceType === 'Practitioner' && !resource.name) {
      violations.push('Practitioner resource must have name');
      recommendations.push('Add required name field');
    }

    // Check for proper coding systems
    if (resource.code && !this.hasValidCoding(resource.code)) {
      violations.push('FHIR resources must use valid coding systems');
      recommendations.push('Use standard FHIR coding systems');
    }

    return {
      compliant: violations.length === 0,
      violations,
      recommendations,
    };
  }

  private isEncrypted(data: any): boolean {
    // Check if data is properly encrypted
    return typeof data === 'string' && data.includes('encrypted');
  }

  private hasAuditLog(action: string): boolean {
    // Check if action is being audited
    return true; // Simplified for demo
  }

  private hasProperAccessControl(): boolean {
    // Check if proper access controls are in place
    return true; // Simplified for demo
  }

  private containsUnnecessaryData(data: any): boolean {
    // Check if data contains unnecessary information
    return false; // Simplified for demo
  }

  private hasConsent(data: any): boolean {
    // Check if consent is present
    return true; // Simplified for demo
  }

  private supportsDataPortability(): boolean {
    // Check if data portability is supported
    return true; // Simplified for demo
  }

  private supportsDataDeletion(): boolean {
    // Check if data deletion is supported
    return true; // Simplified for demo
  }

  private hasValidCoding(code: any): boolean {
    // Check if coding is valid FHIR coding
    return code && code.coding && Array.isArray(code.coding);
  }
}

// Export singleton instances
export const encryptionService = EncryptionService.getInstance();
export const auditService = AuditService.getInstance();
export const dataClassificationService = DataClassificationService.getInstance();
export const complianceService = ComplianceService.getInstance();
