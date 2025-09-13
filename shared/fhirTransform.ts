/**
 * FHIR Data Transformation Utilities
 * Converts internal SehatSetu data models to FHIR R4 format
 */

import { 
  FHIRPatient, 
  FHIRPractitioner, 
  FHIRAppointment, 
  FHIRObservation, 
  FHIRMedication,
  FHIRBundle,
  FHIRCodeSystems,
  FHIRValueSets
} from './fhir';
import { 
  User, 
  Doctor, 
  Pharmacist, 
  Appointment, 
  HealthRecord, 
  Medicine,
  Prescription 
} from './schema';

// Patient Transformation
export function transformUserToFHIRPatient(user: User): FHIRPatient {
  return {
    resourceType: 'Patient',
    id: user.id,
    identifier: [
      {
        use: 'usual',
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MR',
            display: 'Medical Record Number'
          }]
        },
        system: 'https://sehatsetu.com/patient-id',
        value: user.id
      }
    ],
    active: user.isActive || undefined,
    name: user.name ? [{
      use: 'official',
      family: user.name.split(' ').slice(-1)[0] || '',
      given: user.name.split(' ').slice(0, -1) || [user.name]
    }] : undefined,
    telecom: [
      ...(user.phone ? [{
        system: 'phone',
        value: user.phone,
        use: 'mobile'
      }] : []),
      ...(user.email ? [{
        system: 'email',
        value: user.email,
        use: 'home'
      }] : [])
    ],
    gender: user.gender as 'male' | 'female' | 'other' | 'unknown' || 'unknown',
    birthDate: user.dateOfBirth || undefined,
    address: user.address ? [{
      use: 'home',
      type: 'physical',
      text: user.address,
      line: [user.address],
      city: 'Nabha',
      district: 'Patiala',
      state: 'Punjab',
      country: 'India'
    }] : undefined,
    maritalStatus: user.maritalStatus ? {
      coding: [{
        system: FHIRCodeSystems.MARITAL_STATUS,
        code: user.maritalStatus,
        display: user.maritalStatus
      }]
    } : undefined,
    contact: user.emergencyContact ? [{
      relationship: [{
        coding: [{
          system: FHIRCodeSystems.CONTACT_RELATIONSHIP,
          code: 'C',
          display: 'Emergency Contact'
        }]
      }],
      name: {
        family: user.emergencyContact.split(' ').slice(-1)[0] || '',
        given: user.emergencyContact.split(' ').slice(0, -1) || [user.emergencyContact]
      },
      telecom: user.emergencyPhone ? [{
        system: 'phone',
        value: user.emergencyPhone
      }] : undefined
    }] : undefined
  };
}

// Practitioner Transformation
export function transformDoctorToFHIRPractitioner(doctor: Doctor & { user: User }): FHIRPractitioner {
  return {
    resourceType: 'Practitioner',
    id: doctor.id,
    identifier: [
      {
        use: 'official',
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MD',
            display: 'Medical License Number'
          }]
        },
        system: 'https://sehatsetu.com/doctor-id',
        value: doctor.id
      },
      ...(doctor.licenseNumber ? [{
        use: 'official',
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MD',
            display: 'Medical License Number'
          }]
        },
        system: 'https://mciindia.org/license',
        value: doctor.licenseNumber
      }] : [])
    ],
    active: doctor.isActive || undefined,
    name: doctor.user.name ? [{
      use: 'official',
      family: doctor.user.name.split(' ').slice(-1)[0] || '',
      given: doctor.user.name.split(' ').slice(0, -1) || [doctor.user.name]
    }] : undefined,
    telecom: [
      ...(doctor.user.phone ? [{
        system: 'phone',
        value: doctor.user.phone,
        use: 'work'
      }] : []),
      ...(doctor.user.email ? [{
        system: 'email',
        value: doctor.user.email,
        use: 'work'
      }] : [])
    ],
    gender: doctor.user.gender as 'male' | 'female' | 'other' | 'unknown' || 'unknown',
    birthDate: doctor.user.dateOfBirth || undefined,
    address: doctor.user.address ? [{
      use: 'work',
      type: 'physical',
      text: doctor.user.address,
      line: [doctor.user.address],
      city: 'Nabha',
      district: 'Patiala',
      state: 'Punjab',
      country: 'India'
    }] : undefined,
    qualification: [
      {
        identifier: doctor.licenseNumber ? [{
          use: 'official',
          system: 'https://mciindia.org/license',
          value: doctor.licenseNumber
        }] : undefined,
        code: {
          coding: [{
            system: FHIRCodeSystems.PRACTITIONER_QUALIFICATION,
            code: 'MD',
            display: 'Doctor of Medicine'
          }]
        },
        period: {
          start: doctor.experience ? new Date(Date.now() - doctor.experience * 365 * 24 * 60 * 60 * 1000).toISOString() : undefined
        },
        issuer: {
          display: 'Medical Council of India'
        }
      }
    ]
  };
}

// Appointment Transformation
export function transformAppointmentToFHIRAppointment(
  appointment: Appointment & { 
    patient: User; 
    doctor: Doctor & { user: User } 
  }
): FHIRAppointment {
  return {
    resourceType: 'Appointment',
    id: appointment.id,
    identifier: [
      {
        use: 'usual',
        system: 'https://sehatsetu.com/appointment-id',
        value: appointment.id
      }
    ],
    status: mapAppointmentStatus(appointment.status),
    serviceCategory: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/service-category',
        code: 'general',
        display: 'General Medicine'
      }]
    },
    serviceType: appointment.type ? [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/service-type',
        code: appointment.type === 'video' ? 'telemedicine' : 'in-person',
        display: appointment.type === 'video' ? 'Telemedicine Consultation' : 'In-Person Consultation'
      }]
    }] : undefined,
    specialty: appointment.specialty ? [{
      coding: [{
        system: 'http://snomed.info/sct',
        code: mapSpecialtyToSNOMED(appointment.specialty),
        display: appointment.specialty
      }]
    }] : undefined,
    appointmentType: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/v2-0276',
        code: 'ROUTINE',
        display: 'Routine'
      }]
    },
    reasonCode: appointment.reason ? [{
      coding: [{
        system: 'http://snomed.info/sct',
        code: '185349003',
        display: 'Consultation'
      }]
    }] : undefined,
    priority: appointment.priority || 0,
    description: appointment.notes || undefined,
    start: appointment.appointmentTime?.toISOString(),
    end: appointment.appointmentTime ? new Date(new Date(appointment.appointmentTime).getTime() + 30 * 60 * 1000).toISOString() : undefined,
    minutesDuration: 30,
    created: appointment.createdAt?.toISOString(),
    comment: appointment.notes || undefined,
    patientInstruction: appointment.instructions || undefined,
    participant: [
      {
        type: [{
          coding: [{
            system: FHIRCodeSystems.APPOINTMENT_PARTICIPANT_TYPE,
            code: 'ATND',
            display: 'Attending Practitioner'
          }]
        }],
        actor: {
          reference: `Practitioner/${appointment.doctorId}`,
          display: appointment.doctor.user.name
        },
        required: 'required',
        status: 'accepted'
      },
      {
        type: [{
          coding: [{
            system: FHIRCodeSystems.APPOINTMENT_PARTICIPANT_TYPE,
            code: 'PPRF',
            display: 'Primary Performer'
          }]
        }],
        actor: {
          reference: `Patient/${appointment.patientId}`,
          display: appointment.patient.name
        },
        required: 'required',
        status: 'accepted'
      }
    ]
  };
}

// Health Record Transformation
export function transformHealthRecordToFHIRObservation(
  healthRecord: HealthRecord & { 
    patient: User; 
    doctor: Doctor & { user: User } 
  }
): FHIRObservation {
  return {
    resourceType: 'Observation',
    id: healthRecord.id,
    identifier: [
      {
        use: 'usual',
        system: 'https://sehatsetu.com/health-record-id',
        value: healthRecord.id
      }
    ],
    status: 'final',
    category: [{
      coding: [{
        system: FHIRCodeSystems.OBSERVATION_CATEGORY,
        code: 'vital-signs',
        display: 'Vital Signs'
      }]
    }],
    code: {
      coding: [{
        system: 'http://loinc.org',
        code: mapHealthRecordTypeToLOINC(healthRecord.type),
        display: healthRecord.type
      }]
    },
    subject: {
      reference: `Patient/${healthRecord.patientId}`,
      display: healthRecord.patient.name
    },
    effectiveDateTime: healthRecord.recordDate?.toISOString(),
    valueQuantity: healthRecord.value ? {
      value: parseFloat(healthRecord.value),
      unit: healthRecord.unit || '',
      system: 'http://unitsofmeasure.org',
      code: mapUnitToUCUM(healthRecord.unit || '')
    } : undefined,
    valueString: healthRecord.value && isNaN(parseFloat(healthRecord.value)) ? healthRecord.value : undefined,
    interpretation: healthRecord.normalRange ? [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
        code: healthRecord.value && healthRecord.normalRange ? 
          (parseFloat(healthRecord.value) >= parseFloat(healthRecord.normalRange.split('-')[0]) && 
           parseFloat(healthRecord.value) <= parseFloat(healthRecord.normalRange.split('-')[1]) ? 
           'N' : 'H') : 'N',
        display: healthRecord.value && healthRecord.normalRange ? 
          (parseFloat(healthRecord.value) >= parseFloat(healthRecord.normalRange.split('-')[0]) && 
           parseFloat(healthRecord.value) <= parseFloat(healthRecord.normalRange.split('-')[1]) ? 
           'Normal' : 'High') : 'Normal'
      }]
    }] : undefined,
    note: healthRecord.notes ? [{
      text: healthRecord.notes
    }] : undefined,
    referenceRange: healthRecord.normalRange ? [{
      low: {
        value: parseFloat(healthRecord.normalRange.split('-')[0]),
        unit: healthRecord.unit || ''
      },
      high: {
        value: parseFloat(healthRecord.normalRange.split('-')[1]),
        unit: healthRecord.unit || ''
      },
      text: healthRecord.normalRange
    }] : undefined
  };
}

// Medicine Transformation
export function transformMedicineToFHIRMedication(medicine: Medicine): FHIRMedication {
  return {
    resourceType: 'Medication',
    id: medicine.id,
    identifier: [
      {
        use: 'usual',
        system: 'https://sehatsetu.com/medicine-id',
        value: medicine.id
      },
      ...(medicine.barcode ? [{
        use: 'secondary',
        system: 'https://gs1.org/barcode',
        value: medicine.barcode
      }] : [])
    ],
    code: {
      coding: [{
        system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
        code: medicine.id,
        display: medicine.name
      }]
    },
    status: 'active',
    manufacturer: medicine.manufacturer ? {
      display: medicine.manufacturer
    } : undefined,
    form: {
      coding: [{
        system: 'http://snomed.info/sct',
        code: mapMedicineFormToSNOMED(medicine.form || ''),
        display: medicine.form || undefined
      }]
    },
    amount: medicine.dosage ? {
      numerator: {
        value: parseFloat(medicine.dosage.split(' ')[0]),
        unit: medicine.dosage.split(' ')[1] || 'mg'
      },
      denominator: {
        value: 1,
        unit: 'tablet'
      }
    } : undefined,
    batch: medicine.expiryDate ? {
      expirationDate: medicine.expiryDate
    } : undefined
  };
}

// Bundle Creation
export function createFHIRBundle(
  resources: Array<FHIRPatient | FHIRPractitioner | FHIRAppointment | FHIRObservation | FHIRMedication>,
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection' = 'collection'
): FHIRBundle {
  return {
    resourceType: 'Bundle',
    id: crypto.randomUUID(),
    identifier: {
      system: 'https://sehatsetu.com/bundle-id',
      value: crypto.randomUUID()
    },
    type,
    timestamp: new Date().toISOString(),
    total: resources.length,
    entry: resources.map(resource => ({
      fullUrl: `https://sehatsetu.com/fhir/${resource.resourceType}/${resource.id}`,
      resource
    }))
  };
}

// Helper Functions
function mapAppointmentStatus(status: string): 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow' | 'entered-in-error' {
  const statusMap: Record<string, any> = {
    'pending': 'pending',
    'confirmed': 'booked',
    'completed': 'fulfilled',
    'cancelled': 'cancelled',
    'no-show': 'noshow'
  };
  return statusMap[status] || 'proposed';
}

function mapSpecialtyToSNOMED(specialty: string): string {
  const specialtyMap: Record<string, string> = {
    'Cardiology': '394582005',
    'Dermatology': '394581003',
    'Endocrinology': '394580002',
    'Gastroenterology': '394579007',
    'General Practice': '419192003',
    'Internal Medicine': '419610006',
    'Neurology': '394575001',
    'Oncology': '394574002',
    'Pediatrics': '394585009',
    'Psychiatry': '394585009',
    'Pulmonology': '394573008',
    'Radiology': '394586005',
    'Surgery': '394609007'
  };
  return specialtyMap[specialty] || '419192003'; // Default to General Practice
}

function mapHealthRecordTypeToLOINC(type: string): string {
  const typeMap: Record<string, string> = {
    'Blood Pressure': '85354-9',
    'Heart Rate': '8867-4',
    'Temperature': '8310-5',
    'Weight': '29463-7',
    'Height': '8302-2',
    'BMI': '39156-5',
    'Blood Sugar': '33747-0',
    'Cholesterol': '2093-3',
    'Hemoglobin': '718-7',
    'Oxygen Saturation': '2708-6'
  };
  return typeMap[type] || '33747-0'; // Default to Blood Sugar
}

function mapUnitToUCUM(unit: string): string {
  const unitMap: Record<string, string> = {
    'mmHg': 'mm[Hg]',
    'bpm': '/min',
    '°C': 'Cel',
    '°F': '[degF]',
    'kg': 'kg',
    'lbs': '[lb_av]',
    'cm': 'cm',
    'm': 'm',
    'mg/dL': 'mg/dL',
    '%': '%',
    'g/dL': 'g/dL'
  };
  return unitMap[unit] || unit;
}

function mapMedicineFormToSNOMED(form: string): string {
  const formMap: Record<string, string> = {
    'Tablet': '385055001',
    'Capsule': '385056000',
    'Syrup': '385057009',
    'Injection': '385058004',
    'Cream': '385059007',
    'Ointment': '385060002',
    'Drops': '385061003',
    'Inhaler': '385062005',
    'Patch': '385063000',
    'Gel': '385064006'
  };
  return formMap[form] || '385055001'; // Default to Tablet
}

// Export all transformation functions
export const FHIRTransform = {
  transformUserToFHIRPatient,
  transformDoctorToFHIRPractitioner,
  transformAppointmentToFHIRAppointment,
  transformHealthRecordToFHIRObservation,
  transformMedicineToFHIRMedication,
  createFHIRBundle
};
