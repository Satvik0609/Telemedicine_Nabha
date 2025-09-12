import { 
  users, doctors, appointments, healthRecords, medicines, pharmacies, medicineStock, symptomChecks,
  type User, type InsertUser, type Doctor, type InsertDoctor, type Appointment, type InsertAppointment,
  type HealthRecord, type InsertHealthRecord, type Medicine, type InsertMedicine,
  type Pharmacy, type InsertPharmacy, type MedicineStock, type InsertMedicineStock,
  type SymptomCheck, type InsertSymptomCheck
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;

  // Doctor operations
  getDoctor(id: string): Promise<Doctor | undefined>;
  getDoctorByUserId(userId: string): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: string, updates: Partial<InsertDoctor>): Promise<Doctor>;
  getOnlineDoctors(): Promise<(Doctor & { user: User })[]>;
  getDoctorsBySpecialty(specialty: string): Promise<(Doctor & { user: User })[]>;

  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  getPatientAppointments(patientId: string): Promise<(Appointment & { doctor: Doctor & { user: User } })[]>;
  getDoctorAppointments(doctorId: string): Promise<(Appointment & { patient: User })[]>;
  updateAppointment(id: string, updates: Partial<InsertAppointment>): Promise<Appointment>;

  // Health record operations
  createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord>;
  getPatientHealthRecords(patientId: string): Promise<HealthRecord[]>;
  getHealthRecord(id: string): Promise<HealthRecord | undefined>;

  // Medicine operations
  searchMedicines(query: string): Promise<Medicine[]>;
  getMedicine(id: string): Promise<Medicine | undefined>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;

  // Pharmacy operations
  getPharmacies(): Promise<Pharmacy[]>;
  getPharmacy(id: string): Promise<Pharmacy | undefined>;
  createPharmacy(pharmacy: InsertPharmacy): Promise<Pharmacy>;

  // Medicine stock operations
  getMedicineStock(medicineId: string): Promise<(MedicineStock & { pharmacy: Pharmacy })[]>;
  updateMedicineStock(pharmacyId: string, medicineId: string, updates: Partial<InsertMedicineStock>): Promise<MedicineStock>;
  createMedicineStock(stock: InsertMedicineStock): Promise<MedicineStock>;

  // Symptom check operations
  createSymptomCheck(check: InsertSymptomCheck): Promise<SymptomCheck>;
  getPatientSymptomChecks(patientId: string): Promise<SymptomCheck[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getDoctor(id: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor || undefined;
  }

  async getDoctorByUserId(userId: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.userId, userId));
    return doctor || undefined;
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const [doctor] = await db.insert(doctors).values(insertDoctor).returning();
    return doctor;
  }

  async updateDoctor(id: string, updates: Partial<InsertDoctor>): Promise<Doctor> {
    const [doctor] = await db.update(doctors).set(updates).where(eq(doctors.id, id)).returning();
    return doctor;
  }

  async getOnlineDoctors(): Promise<(Doctor & { user: User })[]> {
    const result = await db
      .select()
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(doctors.isOnline, true))
      .orderBy(desc(doctors.rating));
    
    return result.map(({ doctors: doctor, users: user }) => ({ ...doctor, user }));
  }

  async getDoctorsBySpecialty(specialty: string): Promise<(Doctor & { user: User })[]> {
    const result = await db
      .select()
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(doctors.specialty, specialty))
      .orderBy(desc(doctors.rating));
    
    return result.map(({ doctors: doctor, users: user }) => ({ ...doctor, user }));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async getPatientAppointments(patientId: string): Promise<(Appointment & { doctor: Doctor & { user: User } })[]> {
    const result = await db
      .select()
      .from(appointments)
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.scheduledAt));
    
    return result.map(({ appointments: appointment, doctors: doctor, users: user }) => ({
      ...appointment,
      doctor: { ...doctor, user }
    }));
  }

  async getDoctorAppointments(doctorId: string): Promise<(Appointment & { patient: User })[]> {
    const result = await db
      .select()
      .from(appointments)
      .innerJoin(users, eq(appointments.patientId, users.id))
      .where(eq(appointments.doctorId, doctorId))
      .orderBy(desc(appointments.scheduledAt));
    
    return result.map(({ appointments: appointment, users: patient }) => ({
      ...appointment,
      patient
    }));
  }

  async updateAppointment(id: string, updates: Partial<InsertAppointment>): Promise<Appointment> {
    const [appointment] = await db.update(appointments).set(updates).where(eq(appointments.id, id)).returning();
    return appointment;
  }

  async createHealthRecord(insertRecord: InsertHealthRecord): Promise<HealthRecord> {
    const [record] = await db.insert(healthRecords).values(insertRecord).returning();
    return record;
  }

  async getPatientHealthRecords(patientId: string): Promise<HealthRecord[]> {
    return await db
      .select()
      .from(healthRecords)
      .where(eq(healthRecords.patientId, patientId))
      .orderBy(desc(healthRecords.createdAt));
  }

  async getHealthRecord(id: string): Promise<HealthRecord | undefined> {
    const [record] = await db.select().from(healthRecords).where(eq(healthRecords.id, id));
    return record || undefined;
  }

  async searchMedicines(query: string): Promise<Medicine[]> {
    return await db
      .select()
      .from(medicines)
      .where(eq(medicines.name, query))
      .orderBy(asc(medicines.name));
  }

  async getMedicine(id: string): Promise<Medicine | undefined> {
    const [medicine] = await db.select().from(medicines).where(eq(medicines.id, id));
    return medicine || undefined;
  }

  async createMedicine(insertMedicine: InsertMedicine): Promise<Medicine> {
    const [medicine] = await db.insert(medicines).values(insertMedicine).returning();
    return medicine;
  }

  async getPharmacies(): Promise<Pharmacy[]> {
    return await db.select().from(pharmacies).where(eq(pharmacies.isActive, true));
  }

  async getPharmacy(id: string): Promise<Pharmacy | undefined> {
    const [pharmacy] = await db.select().from(pharmacies).where(eq(pharmacies.id, id));
    return pharmacy || undefined;
  }

  async createPharmacy(insertPharmacy: InsertPharmacy): Promise<Pharmacy> {
    const [pharmacy] = await db.insert(pharmacies).values(insertPharmacy).returning();
    return pharmacy;
  }

  async getMedicineStock(medicineId: string): Promise<(MedicineStock & { pharmacy: Pharmacy })[]> {
    const result = await db
      .select()
      .from(medicineStock)
      .innerJoin(pharmacies, eq(medicineStock.pharmacyId, pharmacies.id))
      .where(and(eq(medicineStock.medicineId, medicineId), eq(pharmacies.isActive, true)))
      .orderBy(desc(medicineStock.quantity));
    
    return result.map(({ medicine_stock: stock, pharmacies: pharmacy }) => ({ ...stock, pharmacy }));
  }

  async updateMedicineStock(pharmacyId: string, medicineId: string, updates: Partial<InsertMedicineStock>): Promise<MedicineStock> {
    const [stock] = await db
      .update(medicineStock)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(medicineStock.pharmacyId, pharmacyId), eq(medicineStock.medicineId, medicineId)))
      .returning();
    return stock;
  }

  async createMedicineStock(insertStock: InsertMedicineStock): Promise<MedicineStock> {
    const [stock] = await db.insert(medicineStock).values(insertStock).returning();
    return stock;
  }

  async createSymptomCheck(insertCheck: InsertSymptomCheck): Promise<SymptomCheck> {
    const [check] = await db.insert(symptomChecks).values(insertCheck).returning();
    return check;
  }

  async getPatientSymptomChecks(patientId: string): Promise<SymptomCheck[]> {
    return await db
      .select()
      .from(symptomChecks)
      .where(eq(symptomChecks.patientId, patientId))
      .orderBy(desc(symptomChecks.createdAt));
  }
}

export const storage = new DatabaseStorage();
