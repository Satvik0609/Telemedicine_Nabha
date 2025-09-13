/**
 * Security and Compliance Middleware
 * Implements authentication, authorization, audit logging, and compliance checks
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { 
  auditService, 
  dataClassificationService, 
  complianceService,
  encryptionService,
  SECURITY_CONFIG 
} from '@shared/security';
import { User } from '@shared/schema';

// Extend Express Request type to include user and audit info
declare global {
  namespace Express {
    interface Request {
      user?: User;
      auditInfo?: {
        ipAddress: string;
        userAgent: string;
        location?: {
          latitude?: number;
          longitude?: number;
          city?: string;
          state?: string;
          country?: string;
        };
      };
    }
  }
}

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'sehatsetu-jwt-secret-change-in-production';

// Rate Limiting Middleware
export const rateLimitMiddleware = rateLimit({
  windowMs: SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS,
  max: SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    auditService.logSystemEvent('rate_limit_exceeded', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      method: req.method
    }, 'high');
    
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS / 1000)
    });
  }
});

// Authentication Middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      auditService.logAuthEvent('login_failed', undefined, {
        reason: 'no_token',
        endpoint: req.path,
        ipAddress: req.ip
      });
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // In production, fetch user from database
    // For now, we'll create a mock user
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isActive: true,
      name: decoded.name || '',
      firebaseUid: decoded.firebaseUid || '',
      phone: decoded.phone || null,
      profilePicture: decoded.profilePicture || null,
      createdAt: decoded.createdAt || null
    } as User;

    // Log successful authentication
    auditService.logAuthEvent('token_validated', req.user.id, {
      endpoint: req.path,
      ipAddress: req.ip
    });

    next();
  } catch (error) {
    auditService.logAuthEvent('login_failed', undefined, {
      reason: 'invalid_token',
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint: req.path,
      ipAddress: req.ip
    });
    
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Authorization Middleware
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      auditService.logDataAccess(
        'authorization',
        'role_check',
        req.user.id,
        'read',
        {
          requiredRoles: allowedRoles,
          userRole: req.user.role,
          endpoint: req.path
        }
      );
      
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Data Classification Middleware
export const classifyData = (req: Request, res: Response, next: NextFunction) => {
  // Classify request data
  if (req.body && Object.keys(req.body).length > 0) {
    const classification = dataClassificationService.classifyData(req.body, 'api_request');
    
    // Log data access with classification
    if (req.user) {
      auditService.logDataAccess(
        'data_classification',
        'request_body',
        req.user.id,
        'read',
        {
          classification,
          dataKeys: Object.keys(req.body),
          endpoint: req.path
        }
      );
    }

    // Apply data masking if needed
    if (classification === 'restricted' || classification === 'confidential') {
      req.body = dataClassificationService.maskData(req.body, classification);
    }
  }

  next();
};

// Compliance Middleware
export const checkCompliance = (framework: 'HIPAA' | 'GDPR' | 'HL7_FHIR') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let complianceResult;

      switch (framework) {
        case 'HIPAA':
          complianceResult = complianceService.validateHIPAACompliance(req.body, req.method);
          break;
        case 'GDPR':
          complianceResult = complianceService.validateGDPRCompliance(req.body, req.method);
          break;
        case 'HL7_FHIR':
          complianceResult = complianceService.validateFHIRCompliance(req.body);
          break;
        default:
          throw new Error(`Unknown compliance framework: ${framework}`);
      }

      if (!complianceResult.compliant) {
        auditService.logSystemEvent('compliance_violation', {
          framework,
          violations: complianceResult.violations,
          recommendations: complianceResult.recommendations,
          endpoint: req.path,
          userId: req.user?.id
        }, 'critical');

        return res.status(400).json({
          error: 'Compliance violation',
          framework,
          violations: complianceResult.violations,
          recommendations: complianceResult.recommendations
        });
      }

      // Log compliance check
      auditService.logSystemEvent('compliance_check_passed', {
        framework,
        endpoint: req.path,
        userId: req.user?.id
      }, 'low');

      next();
    } catch (error) {
      auditService.logSystemEvent('compliance_check_error', {
        framework,
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: req.path,
        userId: req.user?.id
      }, 'high');

      return res.status(500).json({ error: 'Compliance check failed' });
    }
  };
};

// Audit Logging Middleware
export const auditMiddleware = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response is sent
      if (req.user) {
        auditService.logDataAccess(
          action,
          resource,
          req.user.id,
          req.method.toLowerCase() as 'read' | 'write' | 'delete' | 'export',
          {
            statusCode: res.statusCode,
            responseSize: data ? data.length : 0,
            endpoint: req.path,
            queryParams: req.query
          }
        );
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

// Encryption Middleware
export const encryptSensitiveData = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      for (const field of fields) {
        if (req.body[field] && typeof req.body[field] === 'string') {
          req.body[field] = encryptionService.encrypt(req.body[field], 'confidential');
        }
      }
    }
    next();
  };
};

// Decryption Middleware
export const decryptSensitiveData = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      for (const field of fields) {
        if (req.body[field] && typeof req.body[field] === 'string' && req.body[field].includes('encrypted')) {
          try {
            req.body[field] = encryptionService.decrypt(req.body[field]);
          } catch (error) {
            auditService.logSystemEvent('decryption_failed', {
              field,
              error: error instanceof Error ? error.message : 'Unknown error',
              endpoint: req.path,
              userId: req.user?.id
            }, 'high');
            
            return res.status(400).json({ error: 'Data decryption failed' });
          }
        }
      }
    }
    next();
  };
};

// Session Management Middleware
export const sessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    // Check session timeout
    const sessionTimeout = SECURITY_CONFIG.SESSION_TIMEOUT_MS;
    const lastActivity = req.headers['x-last-activity'] as string;
    
    if (lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
      if (timeSinceLastActivity > sessionTimeout) {
        auditService.logAuthEvent('session_expired', req.user.id, {
          endpoint: req.path,
          timeSinceLastActivity
        });
        
        return res.status(401).json({ error: 'Session expired' });
      }
    }

    // Update last activity
    res.setHeader('X-Last-Activity', Date.now().toString());
  }

  next();
};

// IP Geolocation Middleware (mock implementation)
export const geolocationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // In production, use a real IP geolocation service
  const mockLocation = {
    latitude: 30.3753, // Nabha, Punjab coordinates
    longitude: 76.1522,
    city: 'Nabha',
    state: 'Punjab',
    country: 'India'
  };

  req.auditInfo = {
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    location: mockLocation
  };

  next();
};

// Security Headers Middleware
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
};

// Error Handling Middleware
export const securityErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Log security-related errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    auditService.logAuthEvent('login_failed', req.user?.id, {
      reason: error.name,
      error: error.message,
      endpoint: req.path,
      ipAddress: req.ip
    });
  } else if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    auditService.logSystemEvent('malformed_request', {
      error: error.message,
      endpoint: req.path,
      userId: req.user?.id,
      ipAddress: req.ip
    }, 'medium');
  } else {
    auditService.logSystemEvent('unexpected_error', {
      error: error.message,
      stack: error.stack,
      endpoint: req.path,
      userId: req.user?.id,
      ipAddress: req.ip
    }, 'high');
  }

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Internal server error',
    ...(isDevelopment && { details: error.message })
  });
};

// Export all middleware functions
export const SecurityMiddleware = {
  rateLimitMiddleware,
  authenticateToken,
  authorizeRole,
  classifyData,
  checkCompliance,
  auditMiddleware,
  encryptSensitiveData,
  decryptSensitiveData,
  sessionMiddleware,
  geolocationMiddleware,
  securityHeadersMiddleware,
  securityErrorHandler
};
