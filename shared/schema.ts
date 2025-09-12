import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role", { enum: ["patient", "doctor"] }).notNull().default("patient"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  specialty: text("specialty").notNull(),
  qualification: text("qualification").notNull(),
  experience: integer("experience").notNull(),
  rating: integer("rating").default(0),
  totalRatings: integer("total_ratings").default(0),
  isOnline: boolean("is_online").default(false),
  consultationFee: integer("consultation_fee").notNull(),
  languages: text("languages").array().notNull(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status", { enum: ["scheduled", "ongoing", "completed", "cancelled"] }).notNull().default("scheduled"),
  type: text("type", { enum: ["video", "audio", "chat"] }).notNull().default("video"),
  notes: text("notes"),
  prescription: jsonb("prescription"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthRecords = pgTable("health_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  doctorId: varchar("doctor_id").references(() => doctors.id),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  type: text("type", { enum: ["vital", "report", "prescription", "diagnosis"] }).notNull(),
  title: text("title").notNull(),
  data: jsonb("data").notNull(),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicines = pgTable("medicines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  dosage: text("dosage").notNull(),
  manufacturer: text("manufacturer"),
  price: integer("price").notNull(),
  description: text("description"),
});

export const pharmacies = pgTable("pharmacies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isActive: boolean("is_active").default(true),
});

export const medicineStock = pgTable("medicine_stock", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pharmacyId: varchar("pharmacy_id").notNull().references(() => pharmacies.id),
  medicineId: varchar("medicine_id").notNull().references(() => medicines.id),
  quantity: integer("quantity").notNull().default(0),
  status: text("status", { enum: ["available", "limited", "out_of_stock"] }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const symptomChecks = pgTable("symptom_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  symptoms: text("symptoms").array().notNull(),
  aiResponse: jsonb("ai_response").notNull(),
  severity: text("severity", { enum: ["low", "medium", "high", "emergency"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  doctor: one(doctors, { fields: [users.id], references: [doctors.userId] }),
  appointments: many(appointments),
  healthRecords: many(healthRecords),
  symptomChecks: many(symptomChecks),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id] }),
  appointments: many(appointments),
  healthRecords: many(healthRecords),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(users, { fields: [appointments.patientId], references: [users.id] }),
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
  healthRecords: many(healthRecords),
}));

export const healthRecordsRelations = relations(healthRecords, ({ one }) => ({
  patient: one(users, { fields: [healthRecords.patientId], references: [users.id] }),
  doctor: one(doctors, { fields: [healthRecords.doctorId], references: [doctors.id] }),
  appointment: one(appointments, { fields: [healthRecords.appointmentId], references: [appointments.id] }),
}));

export const medicineStockRelations = relations(medicineStock, ({ one }) => ({
  pharmacy: one(pharmacies, { fields: [medicineStock.pharmacyId], references: [pharmacies.id] }),
  medicine: one(medicines, { fields: [medicineStock.medicineId], references: [medicines.id] }),
}));

export const symptomChecksRelations = relations(symptomChecks, ({ one }) => ({
  patient: one(users, { fields: [symptomChecks.patientId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });
export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({ id: true, createdAt: true });
export const insertMedicineSchema = createInsertSchema(medicines).omit({ id: true });
export const insertPharmacySchema = createInsertSchema(pharmacies).omit({ id: true });
export const insertMedicineStockSchema = createInsertSchema(medicineStock).omit({ id: true, updatedAt: true });
export const insertSymptomCheckSchema = createInsertSchema(symptomChecks).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type Medicine = typeof medicines.$inferSelect;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Pharmacy = typeof pharmacies.$inferSelect;
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type MedicineStock = typeof medicineStock.$inferSelect;
export type InsertMedicineStock = z.infer<typeof insertMedicineStockSchema>;
export type SymptomCheck = typeof symptomChecks.$inferSelect;
export type InsertSymptomCheck = z.infer<typeof insertSymptomCheckSchema>;
