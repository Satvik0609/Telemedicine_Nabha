import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertDoctorSchema, insertAppointmentSchema, insertHealthRecordSchema, insertSymptomCheckSchema } from "@shared/schema";
// EndlessMedical API - Free medical diagnosis API
// Documentation: https://www.endlessmedical.com/about-endlessmedical-api/

// EndlessMedical API Base URL
const ENDLESSMEDICAL_API_BASE = 'https://endlessmedical.com/v1/dx';

// Helper function to call EndlessMedical API
async function callEndlessMedicalAPI(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${ENDLESSMEDICAL_API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`EndlessMedical API error: ${response.statusText}`);
  }
  return response.json();
}

// Analyze symptoms using EndlessMedical API
async function analyzeWithEndlessMedical(symptoms: string[]) {
  console.log(`[EndlessMedical] Analyzing symptoms: ${symptoms.join(', ')}`);
  
  try {
    // Step 1: Initialize session
    console.log('[EndlessMedical] Initializing session...');
    const sessionResponse = await callEndlessMedicalAPI('InitSession');
    const sessionId = sessionResponse?.SessionID;

    if (!sessionId) {
      console.log('[EndlessMedical] Failed to get session ID, using fallback');
      return getFallbackAnalysis(symptoms);
    }

    console.log(`[EndlessMedical] Session initialized: ${sessionId}`);

    // Step 2: Set basic demographics
    try {
      await callEndlessMedicalAPI('UpdateFeature', { 
        SessionID: sessionId, 
        name: 'Age',
        value: '30'
      });
      console.log('[EndlessMedical] Age set successfully');
    } catch (error) {
      console.log('[EndlessMedical] Could not set age, continuing...');
    }

    // Step 3: Try to add symptoms using common medical terms
    const symptomMapping: Record<string, string> = {
      'fever': 'Fever',
      'headache': 'Headache',
      'nausea': 'Nausea',
      'vomiting': 'Vomiting',
      'cough': 'Cough',
      'sore throat': 'SoreThroat',
      'fatigue': 'Fatigue',
      'dizzy': 'Dizziness',
      'chest pain': 'ChestPain',
      'shortness of breath': 'ShortnessOfBreath'
    };

    for (const symptom of symptoms) {
      const normalizedSymptom = symptom.trim().toLowerCase();
      const medicalTerm = symptomMapping[normalizedSymptom] || symptom.trim();
      
      try {
        await callEndlessMedicalAPI('UpdateFeature', { 
          SessionID: sessionId, 
          name: medicalTerm,
          value: '1'
        });
        console.log(`[EndlessMedical] Added symptom: ${medicalTerm}`);
      } catch (error) {
        console.log(`[EndlessMedical] Could not add symptom ${medicalTerm}: ${error.message}`);
      }
    }

    // Step 4: Get analysis
    console.log('[EndlessMedical] Requesting analysis...');
    const diagnosisResponse = await callEndlessMedicalAPI('Analyze', { SessionID: sessionId });
    console.log('[EndlessMedical] Analysis completed');
    
    // Step 5: Get conditions
    const conditionsResponse = await callEndlessMedicalAPI('GetTopConditions', { 
      SessionID: sessionId,
      NumberOfResults: '5'
    });
    console.log('[EndlessMedical] Conditions retrieved');

    return mapEndlessMedicalResponse(diagnosisResponse, conditionsResponse, symptoms);
  } catch (error) {
    console.error('[EndlessMedical] API Error:', error?.message || error);
    console.log('[EndlessMedical] Using enhanced fallback analysis');
    return getFallbackAnalysis(symptoms);
  }
}

// Map EndlessMedical response to our expected format
function mapEndlessMedicalResponse(diagnosis: any, conditions: any, symptoms: string[]) {
  const topConditions = conditions.Conditions || [];
  const possibleConditions = topConditions.slice(0, 3).map((c: any) => c.Name || 'Unknown condition');
  
  // Determine severity based on conditions and symptoms
  const emergencyKeywords = ['chest pain', 'difficulty breathing', 'severe headache', 'unconscious', 'seizure'];
  const highKeywords = ['fever', 'severe pain', 'bleeding', 'shortness of breath'];
  const mediumKeywords = ['headache', 'nausea', 'dizzy', 'fatigue'];
  
  const symptomText = symptoms.join(' ').toLowerCase();
  let severity: 'low' | 'medium' | 'high' | 'emergency' = 'low';
  let urgency: 'routine' | 'urgent' | 'emergency' = 'routine';

  if (emergencyKeywords.some(keyword => symptomText.includes(keyword))) {
    severity = 'emergency';
    urgency = 'emergency';
  } else if (highKeywords.some(keyword => symptomText.includes(keyword))) {
    severity = 'high';
    urgency = 'urgent';
  } else if (mediumKeywords.some(keyword => symptomText.includes(keyword))) {
    severity = 'medium';
    urgency = 'routine';
  }

  const recommendations = generateRecommendations(severity, possibleConditions);

  return {
    possibleConditions: possibleConditions.length > 0 ? possibleConditions : ['General health assessment needed'],
    severity,
    recommendations,
    urgency,
    disclaimer: "This is a preliminary assessment powered by EndlessMedical AI. Always consult with a qualified healthcare professional for proper diagnosis and treatment. This tool is not a substitute for professional medical advice."
  };
}

// Generate recommendations based on severity and conditions
function generateRecommendations(severity: string, conditions: string[]) {
  const baseRecommendations = [
    "Monitor your symptoms closely",
    "Stay hydrated and get adequate rest",
    "Consult with a healthcare professional if symptoms persist"
  ];

  switch (severity) {
    case 'emergency':
      return [
        "Seek immediate medical attention",
        "Call emergency services (108 in India)",
        "Do not delay medical care",
        "Have someone accompany you to the hospital"
      ];
    case 'high':
      return [
        "Consult a doctor within 24 hours",
        "Monitor symptoms for any worsening",
        "Consider visiting a clinic or hospital",
        "Keep track of symptom changes"
      ];
    case 'medium':
      return [
        "Schedule an appointment with your doctor",
        "Continue monitoring symptoms",
        "Maintain good self-care practices",
        "Seek care if symptoms worsen"
      ];
    default:
      return baseRecommendations;
  }
}

// Fallback analysis when API is unavailable
function getFallbackAnalysis(symptoms: string[]) {
  console.log('[Fallback] Providing enhanced symptom analysis');
  const symptomText = symptoms.join(' ').toLowerCase();
  
  // Enhanced symptom analysis with medical knowledge base
  let severity: 'low' | 'medium' | 'high' | 'emergency' = 'medium';
  let urgency: 'routine' | 'urgent' | 'emergency' = 'routine';
  let possibleConditions: string[] = [];

  // Emergency symptoms
  const emergencySymptoms = ['chest pain', 'difficulty breathing', 'shortness of breath', 'severe headache', 'unconscious', 'seizure', 'severe abdominal pain'];
  if (emergencySymptoms.some(symptom => symptomText.includes(symptom))) {
    severity = 'emergency';
    urgency = 'emergency';
    possibleConditions = ['Cardiac event', 'Respiratory emergency', 'Neurological emergency', 'Requires immediate medical attention'];
  }
  // High severity symptoms
  else if (symptomText.includes('fever') && symptomText.includes('headache')) {
    severity = 'high';
    urgency = 'urgent';
    possibleConditions = ['Viral infection', 'Bacterial infection', 'Flu-like illness', 'Meningitis (rare but serious)'];
  }
  else if (symptomText.includes('fever')) {
    severity = 'high';
    urgency = 'urgent';
    possibleConditions = ['Viral fever', 'Bacterial infection', 'Common cold', 'Flu'];
  }
  else if (symptomText.includes('headache') && symptomText.includes('nausea')) {
    severity = 'medium';
    urgency = 'routine';
    possibleConditions = ['Migraine', 'Tension headache', 'Dehydration', 'Stress-related headache'];
  }
  else if (symptomText.includes('headache')) {
    severity = 'medium';
    urgency = 'routine';
    possibleConditions = ['Tension headache', 'Cluster headache', 'Sinus headache', 'Dehydration'];
  }
  else if (symptomText.includes('cough') || symptomText.includes('sore throat')) {
    severity = 'medium';
    urgency = 'routine';
    possibleConditions = ['Upper respiratory infection', 'Common cold', 'Bronchitis', 'Allergies'];
  }
  else if (symptomText.includes('nausea') || symptomText.includes('vomiting')) {
    severity = 'medium';
    urgency = 'routine';
    possibleConditions = ['Gastroenteritis', 'Food poisoning', 'Motion sickness', 'Viral infection'];
  }
  else if (symptomText.includes('fatigue') || symptomText.includes('tired')) {
    severity = 'low';
    urgency = 'routine';
    possibleConditions = ['Sleep deprivation', 'Stress', 'Vitamin deficiency', 'Viral infection'];
  }
  else {
    severity = 'low';
    urgency = 'routine';
    possibleConditions = ['General health assessment needed', 'Multiple possible causes'];
  }

  console.log(`[Fallback] Analysis complete - Severity: ${severity}, Conditions: ${possibleConditions.length}`);

  return {
    possibleConditions,
    severity,
    recommendations: generateRecommendations(severity, possibleConditions),
    urgency,
    disclaimer: "This is an enhanced symptom assessment powered by medical knowledge base. While comprehensive, this is not a substitute for professional medical diagnosis. Please consult with a qualified healthcare professional for proper evaluation and treatment."
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for video calls and real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const rooms = new Map<string, Set<WebSocket>>();

  wss.on('connection', (ws: WebSocket) => {
    let currentRoom: string | null = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'join-room':
            currentRoom = data.roomId;
            if (currentRoom && !rooms.has(currentRoom)) {
              rooms.set(currentRoom, new Set());
            }
            if (currentRoom) {
              rooms.get(currentRoom)!.add(ws);
              
              // Notify other participants
              rooms.get(currentRoom)!.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({ type: 'user-joined', userId: data.userId }));
                }
              });
            }
            break;
            
          case 'webrtc-offer':
          case 'webrtc-answer':
          case 'webrtc-ice-candidate':
            // Forward WebRTC signaling to other participants in room
            if (currentRoom && rooms.has(currentRoom)) {
              rooms.get(currentRoom)!.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify(data));
                }
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (currentRoom && rooms.has(currentRoom)) {
        rooms.get(currentRoom)!.delete(ws);
        if (rooms.get(currentRoom)!.size === 0) {
          rooms.delete(currentRoom);
        }
      }
    });
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/users/firebase/:firebaseUid", async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.params.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, updates);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Doctor routes
  app.post("/api/doctors", async (req, res) => {
    try {
      const doctorData = insertDoctorSchema.parse(req.body);
      const doctor = await storage.createDoctor(doctorData);
      res.json(doctor);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/doctors/online", async (req, res) => {
    try {
      const doctors = await storage.getOnlineDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/doctors/specialty/:specialty", async (req, res) => {
    try {
      const doctors = await storage.getDoctorsBySpecialty(req.params.specialty);
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.put("/api/doctors/:id/status", async (req, res) => {
    try {
      const { isOnline } = req.body;
      const doctor = await storage.updateDoctor(req.params.id, { isOnline });
      res.json(doctor);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Appointment routes
  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/appointments/patient/:patientId", async (req, res) => {
    try {
      const appointments = await storage.getPatientAppointments(req.params.patientId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/appointments/doctor/:doctorId", async (req, res) => {
    try {
      const appointments = await storage.getDoctorAppointments(req.params.doctorId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const updates = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(req.params.id, updates);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Health records routes
  app.post("/api/health-records", async (req, res) => {
    try {
      const recordData = insertHealthRecordSchema.parse(req.body);
      const record = await storage.createHealthRecord(recordData);
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/health-records/patient/:patientId", async (req, res) => {
    try {
      const records = await storage.getPatientHealthRecords(req.params.patientId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Medicine routes
  app.get("/api/medicines/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      const medicines = await storage.searchMedicines(q);
      res.json(medicines);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/medicines/:id/stock", async (req, res) => {
    try {
      const stock = await storage.getMedicineStock(req.params.id);
      res.json(stock);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Pharmacy routes
  app.get("/api/pharmacies", async (req, res) => {
    try {
      const pharmacies = await storage.getPharmacies();
      res.json(pharmacies);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Symptom checker routes
  app.post("/api/symptom-check", async (req, res) => {
    try {
      const { symptoms, patientId } = req.body;
      
      if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        return res.status(400).json({ error: "Symptoms array is required" });
      }

      if (!patientId) {
        return res.status(400).json({ error: "Patient ID is required" });
      }

      // AI analysis using EndlessMedical API (Free)
      const aiResponse = await analyzeWithEndlessMedical(symptoms);
      
      // Save symptom check to database
      const symptomCheck = await storage.createSymptomCheck({
        patientId,
        symptoms,
        aiResponse,
        severity: aiResponse.severity
      });

      res.json(symptomCheck);
    } catch (error) {
      console.error('Symptom check error:', error);
      res.status(500).json({ error: "Failed to analyze symptoms. Please try again later." });
    }
  });

  app.get("/api/symptom-checks/patient/:patientId", async (req, res) => {
    try {
      const checks = await storage.getPatientSymptomChecks(req.params.patientId);
      res.json(checks);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  return httpServer;
}
