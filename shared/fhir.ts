/**
 * FHIR R4 Compliance Layer for SehatSetu
 * Implements core FHIR resources for healthcare data interoperability
 */

import { z } from 'zod';

// FHIR Base Types
export const FHIRCodeableConceptSchema = z.object({
  coding: z.array(z.object({
    system: z.string().optional(),
    code: z.string().optional(),
    display: z.string().optional(),
  })).optional(),
  text: z.string().optional(),
});

export const FHIRReferenceSchema = z.object({
  reference: z.string().optional(),
  display: z.string().optional(),
});

export const FHIRPeriodSchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
});

export const FHIRQuantitySchema = z.object({
  value: z.number().optional(),
  unit: z.string().optional(),
  system: z.string().optional(),
  code: z.string().optional(),
});

// FHIR Patient Resource
export const FHIRPatientSchema = z.object({
  resourceType: z.literal('Patient'),
  id: z.string().optional(),
  identifier: z.array(z.object({
    use: z.string().optional(),
    type: z.object({
      coding: z.array(z.object({
        system: z.string().optional(),
        code: z.string().optional(),
        display: z.string().optional(),
      })).optional(),
    }).optional(),
    system: z.string().optional(),
    value: z.string().optional(),
  })).optional(),
  active: z.boolean().optional(),
  name: z.array(z.object({
    use: z.string().optional(),
    family: z.string().optional(),
    given: z.array(z.string()).optional(),
    prefix: z.array(z.string()).optional(),
    suffix: z.array(z.string()).optional(),
  })).optional(),
  telecom: z.array(z.object({
    system: z.string().optional(),
    value: z.string().optional(),
    use: z.string().optional(),
  })).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  birthDate: z.string().optional(),
  address: z.array(z.object({
    use: z.string().optional(),
    type: z.string().optional(),
    text: z.string().optional(),
    line: z.array(z.string()).optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  })).optional(),
  maritalStatus: z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  }).optional(),
  contact: z.array(z.object({
    relationship: z.array(z.object({
      coding: z.array(z.object({
        system: z.string().optional(),
        code: z.string().optional(),
        display: z.string().optional(),
      })).optional(),
    })).optional(),
    name: z.object({
      family: z.string().optional(),
      given: z.array(z.string()).optional(),
    }).optional(),
    telecom: z.array(z.object({
      system: z.string().optional(),
      value: z.string().optional(),
    })).optional(),
  })).optional(),
});

// FHIR Practitioner Resource
export const FHIRPractitionerSchema = z.object({
  resourceType: z.literal('Practitioner'),
  id: z.string().optional(),
  identifier: z.array(z.object({
    use: z.string().optional(),
    type: z.object({
      coding: z.array(z.object({
        system: z.string().optional(),
        code: z.string().optional(),
        display: z.string().optional(),
      })).optional(),
    }).optional(),
    system: z.string().optional(),
    value: z.string().optional(),
  })).optional(),
  active: z.boolean().optional(),
  name: z.array(z.object({
    use: z.string().optional(),
    family: z.string().optional(),
    given: z.array(z.string()).optional(),
    prefix: z.array(z.string()).optional(),
    suffix: z.array(z.string()).optional(),
  })).optional(),
  telecom: z.array(z.object({
    system: z.string().optional(),
    value: z.string().optional(),
    use: z.string().optional(),
  })).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  birthDate: z.string().optional(),
  address: z.array(z.object({
    use: z.string().optional(),
    type: z.string().optional(),
    text: z.string().optional(),
    line: z.array(z.string()).optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  })).optional(),
  qualification: z.array(z.object({
    identifier: z.array(z.object({
      use: z.string().optional(),
      system: z.string().optional(),
      value: z.string().optional(),
    })).optional(),
    code: z.object({
      coding: z.array(z.object({
        system: z.string().optional(),
        code: z.string().optional(),
        display: z.string().optional(),
      })).optional(),
    }).optional(),
    period: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
    issuer: z.object({
      display: z.string().optional(),
    }).optional(),
  })).optional(),
});

// FHIR Appointment Resource
export const FHIRAppointmentSchema = z.object({
  resourceType: z.literal('Appointment'),
  id: z.string().optional(),
  identifier: z.array(z.object({
    use: z.string().optional(),
    system: z.string().optional(),
    value: z.string().optional(),
  })).optional(),
  status: z.enum(['proposed', 'pending', 'booked', 'arrived', 'fulfilled', 'cancelled', 'noshow', 'entered-in-error']),
  serviceCategory: z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  }).optional(),
  serviceType: z.array(z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  })).optional(),
  specialty: z.array(z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  })).optional(),
  appointmentType: z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  }).optional(),
  reasonCode: z.array(z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  })).optional(),
  priority: z.number().optional(),
  description: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  minutesDuration: z.number().optional(),
  slot: z.array(z.object({
    reference: z.string().optional(),
  })).optional(),
  created: z.string().optional(),
  comment: z.string().optional(),
  patientInstruction: z.string().optional(),
  basedOn: z.array(z.object({
    reference: z.string().optional(),
  })).optional(),
  participant: z.array(z.object({
    type: z.array(z.object({
      coding: z.array(z.object({
        system: z.string().optional(),
        code: z.string().optional(),
        display: z.string().optional(),
      })).optional(),
    })).optional(),
    actor: z.object({
      reference: z.string().optional(),
      display: z.string().optional(),
    }).optional(),
    required: z.enum(['required', 'optional', 'information-only']).optional(),
    status: z.enum(['accepted', 'declined', 'tentative', 'needs-action']),
  })),
});

// FHIR Observation Resource (for health records)
export const FHIRObservationSchema = z.object({
  resourceType: z.literal('Observation'),
  id: z.string().optional(),
  identifier: z.array(z.object({
    use: z.string().optional(),
    system: z.string().optional(),
    value: z.string().optional(),
  })).optional(),
  status: z.enum(['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error', 'unknown']),
  category: z.array(z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  })).optional(),
  code: z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  }),
  subject: z.object({
    reference: z.string().optional(),
    display: z.string().optional(),
  }).optional(),
  effectiveDateTime: z.string().optional(),
  effectivePeriod: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
  valueQuantity: z.object({
    value: z.number().optional(),
    unit: z.string().optional(),
    system: z.string().optional(),
    code: z.string().optional(),
  }).optional(),
  valueString: z.string().optional(),
  valueBoolean: z.boolean().optional(),
  valueDateTime: z.string().optional(),
  valueCodeableConcept: z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  }).optional(),
  interpretation: z.array(z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  })).optional(),
  note: z.array(z.object({
    text: z.string().optional(),
  })).optional(),
  bodySite: z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  }).optional(),
  method: z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  }).optional(),
  specimen: z.object({
    reference: z.string().optional(),
  }).optional(),
  device: z.object({
    reference: z.string().optional(),
  }).optional(),
  referenceRange: z.array(z.object({
    low: z.object({
      value: z.number().optional(),
      unit: z.string().optional(),
    }).optional(),
    high: z.object({
      value: z.number().optional(),
      unit: z.string().optional(),
    }).optional(),
    type: z.object({
      coding: z.array(z.object({
        system: z.string().optional(),
        code: z.string().optional(),
        display: z.string().optional(),
      })).optional(),
    }).optional(),
    appliesTo: z.array(z.object({
      coding: z.array(z.object({
        system: z.string().optional(),
        code: z.string().optional(),
        display: z.string().optional(),
      })).optional(),
    })).optional(),
    age: z.object({
      low: z.object({
        value: z.number().optional(),
        unit: z.string().optional(),
      }).optional(),
      high: z.object({
        value: z.number().optional(),
        unit: z.string().optional(),
      }).optional(),
    }).optional(),
    text: z.string().optional(),
  })).optional(),
});

// FHIR Medication Resource
export const FHIRMedicationSchema = z.object({
  resourceType: z.literal('Medication'),
  id: z.string().optional(),
  identifier: z.array(z.object({
    use: z.string().optional(),
    system: z.string().optional(),
    value: z.string().optional(),
  })).optional(),
  code: z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  }).optional(),
  status: z.enum(['active', 'inactive', 'entered-in-error']).optional(),
  manufacturer: z.object({
    display: z.string().optional(),
  }).optional(),
  form: z.object({
    coding: z.array(z.object({
      system: z.string().optional(),
      code: z.string().optional(),
      display: z.string().optional(),
    })).optional(),
  }).optional(),
  amount: z.object({
    numerator: z.object({
      value: z.number().optional(),
      unit: z.string().optional(),
    }).optional(),
    denominator: z.object({
      value: z.number().optional(),
      unit: z.string().optional(),
    }).optional(),
  }).optional(),
  ingredient: z.array(z.object({
    itemCodeableConcept: z.object({
      coding: z.array(z.object({
        system: z.string().optional(),
        code: z.string().optional(),
        display: z.string().optional(),
      })).optional(),
    }).optional(),
    itemReference: z.object({
      reference: z.string().optional(),
    }).optional(),
    isActive: z.boolean().optional(),
    strength: z.object({
      numerator: z.object({
        value: z.number().optional(),
        unit: z.string().optional(),
      }).optional(),
      denominator: z.object({
        value: z.number().optional(),
        unit: z.string().optional(),
      }).optional(),
    }).optional(),
  })).optional(),
  batch: z.object({
    lotNumber: z.string().optional(),
    expirationDate: z.string().optional(),
  }).optional(),
});

// FHIR Bundle Resource (for data exchange)
export const FHIRBundleSchema = z.object({
  resourceType: z.literal('Bundle'),
  id: z.string().optional(),
  identifier: z.object({
    system: z.string().optional(),
    value: z.string().optional(),
  }).optional(),
  type: z.enum(['document', 'message', 'transaction', 'transaction-response', 'batch', 'batch-response', 'history', 'searchset', 'collection']),
  timestamp: z.string().optional(),
  total: z.number().optional(),
  link: z.array(z.object({
    relation: z.string().optional(),
    url: z.string().optional(),
  })).optional(),
  entry: z.array(z.object({
    link: z.array(z.object({
      relation: z.string().optional(),
      url: z.string().optional(),
    })).optional(),
    fullUrl: z.string().optional(),
    resource: z.any().optional(), // Can be any FHIR resource
    search: z.object({
      mode: z.enum(['match', 'include', 'outcome']).optional(),
    }).optional(),
    request: z.object({
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
      url: z.string().optional(),
      ifNoneMatch: z.string().optional(),
      ifModifiedSince: z.string().optional(),
      ifMatch: z.string().optional(),
      ifNoneExist: z.string().optional(),
    }).optional(),
    response: z.object({
      status: z.string().optional(),
      location: z.string().optional(),
      etag: z.string().optional(),
      lastModified: z.string().optional(),
      outcome: z.any().optional(),
    }).optional(),
  })).optional(),
});

// Type exports
export type FHIRPatient = z.infer<typeof FHIRPatientSchema>;
export type FHIRPractitioner = z.infer<typeof FHIRPractitionerSchema>;
export type FHIRAppointment = z.infer<typeof FHIRAppointmentSchema>;
export type FHIRObservation = z.infer<typeof FHIRObservationSchema>;
export type FHIRMedication = z.infer<typeof FHIRMedicationSchema>;
export type FHIRBundle = z.infer<typeof FHIRBundleSchema>;
export type FHIRCodeableConcept = z.infer<typeof FHIRCodeableConceptSchema>;
export type FHIRReference = z.infer<typeof FHIRReferenceSchema>;
export type FHIRPeriod = z.infer<typeof FHIRPeriodSchema>;
export type FHIRQuantity = z.infer<typeof FHIRQuantitySchema>;

// FHIR Code Systems
export const FHIRCodeSystems = {
  // Appointment status codes
  APPOINTMENT_STATUS: 'http://hl7.org/fhir/appointmentstatus',
  
  // Observation status codes
  OBSERVATION_STATUS: 'http://hl7.org/fhir/observation-status',
  
  // Gender codes
  GENDER: 'http://hl7.org/fhir/administrative-gender',
  
  // Marital status codes
  MARITAL_STATUS: 'http://hl7.org/fhir/v3/MaritalStatus',
  
  // Contact relationship codes
  CONTACT_RELATIONSHIP: 'http://hl7.org/fhir/patient-contact-relationship',
  
  // Practitioner qualification codes
  PRACTITIONER_QUALIFICATION: 'http://hl7.org/fhir/v2/0360',
  
  // Appointment participant type codes
  APPOINTMENT_PARTICIPANT_TYPE: 'http://hl7.org/fhir/v3/ParticipationType',
  
  // Appointment participant status codes
  APPOINTMENT_PARTICIPANT_STATUS: 'http://hl7.org/fhir/participationstatus',
  
  // Observation category codes
  OBSERVATION_CATEGORY: 'http://terminology.hl7.org/CodeSystem/observation-category',
  
  // Medication status codes
  MEDICATION_STATUS: 'http://hl7.org/fhir/medication-status',
  
  // Bundle type codes
  BUNDLE_TYPE: 'http://hl7.org/fhir/bundle-type',
} as const;

// FHIR Value Sets
export const FHIRValueSets = {
  // Common Indian languages
  LANGUAGES: {
    HINDI: 'hi',
    PUNJABI: 'pa',
    ENGLISH: 'en',
    TAMIL: 'ta',
    TELUGU: 'te',
    BENGALI: 'bn',
    MARATHI: 'mr',
    GUJARATI: 'gu',
    KANNADA: 'kn',
    MALAYALAM: 'ml',
  },
  
  // Indian states and union territories
  INDIAN_STATES: {
    PUNJAB: 'IN-PB',
    HARYANA: 'IN-HR',
    DELHI: 'IN-DL',
    HIMACHAL_PRADESH: 'IN-HP',
    UTTAR_PRADESH: 'IN-UP',
    RAJASTHAN: 'IN-RJ',
    MAHARASHTRA: 'IN-MH',
    GUJARAT: 'IN-GJ',
    KARNATAKA: 'IN-KA',
    TAMIL_NADU: 'IN-TN',
    KERALA: 'IN-KL',
    WEST_BENGAL: 'IN-WB',
    BIHAR: 'IN-BR',
    ODISHA: 'IN-OR',
    ASSAM: 'IN-AS',
    MADHYA_PRADESH: 'IN-MP',
    JHARKHAND: 'IN-JH',
    CHHATTISGARH: 'IN-CT',
    UTTARAKHAND: 'IN-UT',
    ANDHRA_PRADESH: 'IN-AP',
    TELANGANA: 'IN-TG',
    GOA: 'IN-GA',
    MANIPUR: 'IN-MN',
    MEGHALAYA: 'IN-ML',
    MIZORAM: 'IN-MZ',
    NAGALAND: 'IN-NL',
    SIKKIM: 'IN-SK',
    TRIPURA: 'IN-TR',
    ARUNACHAL_PRADESH: 'IN-AR',
    JAMMU_KASHMIR: 'IN-JK',
    LADAKH: 'IN-LA',
    ANDAMAN_NICOBAR: 'IN-AN',
    CHANDIGARH: 'IN-CH',
    DADRA_NAGAR_HAVELI: 'IN-DN',
    DAMAN_DIU: 'IN-DD',
    LAKSHADWEEP: 'IN-LD',
    PUDUCHERRY: 'IN-PY',
  },
  
  // Common medical specialties in India
  MEDICAL_SPECIALTIES: {
    GENERAL_PRACTICE: '419192003',
    INTERNAL_MEDICINE: '419610006',
    PEDIATRICS: '394585009',
    CARDIOLOGY: '394582005',
    DERMATOLOGY: '394581003',
    ENDOCRINOLOGY: '394580002',
    GASTROENTEROLOGY: '394579007',
    HEMATOLOGY: '394578004',
    INFECTIOUS_DISEASE: '394577009',
    NEPHROLOGY: '394576000',
    NEUROLOGY: '394575001',
    ONCOLOGY: '394574002',
    PULMONOLOGY: '394573008',
    RHEUMATOLOGY: '394572003',
    SURGERY: '394609007',
    ORTHOPEDICS: '394610002',
    UROLOGY: '394611003',
    GYNECOLOGY: '394582005',
    OBSTETRICS: '394582005',
    OPHTHALMOLOGY: '394583000',
    OTOLARYNGOLOGY: '394584006',
    PSYCHIATRY: '394585009',
    RADIOLOGY: '394586005',
    ANESTHESIOLOGY: '394587001',
    EMERGENCY_MEDICINE: '394588006',
    FAMILY_MEDICINE: '419192003',
  },
} as const;
