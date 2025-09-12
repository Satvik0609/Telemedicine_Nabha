import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertDoctorSchema, insertAppointmentSchema, insertHealthRecordSchema, insertSymptomCheckSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

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
            if (!rooms.has(currentRoom)) {
              rooms.set(currentRoom, new Set());
            }
            rooms.get(currentRoom)!.add(ws);
            
            // Notify other participants
            rooms.get(currentRoom)!.forEach(client => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'user-joined', userId: data.userId }));
              }
            });
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
      res.status(400).json({ error: error.message });
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
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, updates);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Doctor routes
  app.post("/api/doctors", async (req, res) => {
    try {
      const doctorData = insertDoctorSchema.parse(req.body);
      const doctor = await storage.createDoctor(doctorData);
      res.json(doctor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/doctors/online", async (req, res) => {
    try {
      const doctors = await storage.getOnlineDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/doctors/specialty/:specialty", async (req, res) => {
    try {
      const doctors = await storage.getDoctorsBySpecialty(req.params.specialty);
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/doctors/:id/status", async (req, res) => {
    try {
      const { isOnline } = req.body;
      const doctor = await storage.updateDoctor(req.params.id, { isOnline });
      res.json(doctor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Appointment routes
  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/appointments/patient/:patientId", async (req, res) => {
    try {
      const appointments = await storage.getPatientAppointments(req.params.patientId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/appointments/doctor/:doctorId", async (req, res) => {
    try {
      const appointments = await storage.getDoctorAppointments(req.params.doctorId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const updates = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(req.params.id, updates);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Health records routes
  app.post("/api/health-records", async (req, res) => {
    try {
      const recordData = insertHealthRecordSchema.parse(req.body);
      const record = await storage.createHealthRecord(recordData);
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/health-records/patient/:patientId", async (req, res) => {
    try {
      const records = await storage.getPatientHealthRecords(req.params.patientId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
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
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/medicines/:id/stock", async (req, res) => {
    try {
      const stock = await storage.getMedicineStock(req.params.id);
      res.json(stock);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Pharmacy routes
  app.get("/api/pharmacies", async (req, res) => {
    try {
      const pharmacies = await storage.getPharmacies();
      res.json(pharmacies);
    } catch (error) {
      res.status(500).json({ error: error.message });
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

      // AI analysis using OpenAI
      const prompt = `Analyze these symptoms and provide a medical assessment: ${symptoms.join(', ')}. 
      Respond with JSON in this format: {
        "possibleConditions": ["condition1", "condition2"],
        "severity": "low|medium|high|emergency",
        "recommendations": ["recommendation1", "recommendation2"],
        "urgency": "routine|urgent|emergency",
        "disclaimer": "Medical disclaimer text"
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a medical AI assistant. Provide helpful preliminary assessments but always recommend consulting with healthcare professionals for proper diagnosis and treatment."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const aiResponse = JSON.parse(response.choices[0].message.content);
      
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
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
