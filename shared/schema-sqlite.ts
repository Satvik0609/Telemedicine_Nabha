import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("patient"),
  profilePicture: text("profile_picture"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  gender: text("gender"),
  dateOfBirth: text("date_of_birth"),
  address: text("address"),
  maritalStatus: text("marital_status"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const doctors = sqliteTable("doctors", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  specialty: text("specialty").notNull(),
  qualification: text("qualification").notNull(),
  experience: integer("experience").notNull(),
  rating: integer("rating").default(0),
  totalRatings: integer("total_ratings").default(0),
  isOnline: integer("is_online", { mode: "boolean" }).default(false),
  consultationFee: integer("consultation_fee").notNull(),
  languages: text("languages").notNull(), // JSON string for SQLite
  licenseNumber: text("license_number"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text("patient_id").notNull().references(() => users.id),
  doctorId: text("doctor_id").notNull().references(() => doctors.id),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }).notNull(),
  status: text("status").notNull().default("scheduled"),
  type: text("type").notNull().default("video"),
  notes: text("notes"),
  prescription: text("prescription"), // JSON string for SQLite
  specialty: text("specialty"),
  reason: text("reason"),
  priority: integer("priority").default(0),
  appointmentTime: integer("appointment_time", { mode: "timestamp" }),
  instructions: text("instructions"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const healthRecords = sqliteTable("health_records", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text("patient_id").notNull().references(() => users.id),
  doctorId: text("doctor_id").references(() => doctors.id),
  appointmentId: text("appointment_id").references(() => appointments.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  data: text("data").notNull(), // JSON string for SQLite
  fileUrl: text("file_url"),
  recordDate: integer("record_date", { mode: "timestamp" }),
  value: text("value"),
  unit: text("unit"),
  normalRange: text("normal_range"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const medicines = sqliteTable("medicines", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  dosage: text("dosage").notNull(),
  manufacturer: text("manufacturer"),
  price: integer("price").notNull(),
  description: text("description"),
  barcode: text("barcode"),
  form: text("form"),
  expiryDate: text("expiry_date"),
});

export const pharmacies = sqliteTable("pharmacies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  pharmacistId: text("pharmacist_id").references(() => users.id),
  licenseNumber: text("license_number"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const pharmacists = sqliteTable("pharmacists", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  pharmacyId: text("pharmacy_id").references(() => pharmacies.id),
  licenseNumber: text("license_number").notNull(),
  qualification: text("qualification").notNull(),
  experience: integer("experience").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const medicineStock = sqliteTable("medicine_stock", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  medicineId: text("medicine_id").notNull().references(() => medicines.id),
  pharmacyId: text("pharmacy_id").notNull().references(() => pharmacies.id),
  quantity: integer("quantity").notNull(),
  minimumStock: integer("minimum_stock").notNull(),
  maximumStock: integer("maximum_stock").notNull(),
  status: text("status").notNull().default("available"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const prescriptions = sqliteTable("prescriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text("patient_id").notNull().references(() => users.id),
  doctorId: text("doctor_id").notNull().references(() => doctors.id),
  appointmentId: text("appointment_id").references(() => appointments.id),
  medicines: text("medicines").notNull(), // JSON string for SQLite
  instructions: text("instructions"),
  status: text("status").notNull().default("pending"),
  pharmacyId: text("pharmacy_id").references(() => pharmacies.id),
  pharmacistId: text("pharmacist_id").references(() => pharmacists.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const symptomChecks = sqliteTable("symptom_checks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text("patient_id").notNull().references(() => users.id),
  symptoms: text("symptoms").notNull(), // JSON string for SQLite
  aiResponse: text("ai_response").notNull(), // JSON string for SQLite
  severity: text("severity").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const analytics = sqliteTable("analytics", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: text("type").notNull(),
  data: text("data").notNull(), // JSON string for SQLite
  date: integer("date", { mode: "timestamp" }).notNull(),
  location: text("location"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: text("details"), // JSON string for SQLite
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  doctor: one(doctors, { fields: [users.id], references: [doctors.userId] }),
  pharmacist: one(pharmacists, { fields: [users.id], references: [pharmacists.userId] }),
  appointments: many(appointments),
  healthRecords: many(healthRecords),
  symptomChecks: many(symptomChecks),
  prescriptions: many(prescriptions),
  auditLogs: many(auditLogs),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id] }),
  appointments: many(appointments),
  healthRecords: many(healthRecords),
  prescriptions: many(prescriptions),
}));

export const pharmacistsRelations = relations(pharmacists, ({ one, many }) => ({
  user: one(users, { fields: [pharmacists.userId], references: [users.id] }),
  pharmacy: one(pharmacies, { fields: [pharmacists.pharmacyId], references: [pharmacies.id] }),
  prescriptions: many(prescriptions),
}));

export const pharmaciesRelations = relations(pharmacies, ({ one, many }) => ({
  pharmacist: one(pharmacists, { fields: [pharmacies.pharmacistId], references: [pharmacies.userId] }),
  medicineStock: many(medicineStock),
  prescriptions: many(prescriptions),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(users, { fields: [appointments.patientId], references: [users.id] }),
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
  healthRecords: many(healthRecords),
  prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  patient: one(users, { fields: [prescriptions.patientId], references: [users.id] }),
  doctor: one(doctors, { fields: [prescriptions.doctorId], references: [doctors.id] }),
  appointment: one(appointments, { fields: [prescriptions.appointmentId], references: [appointments.id] }),
  pharmacy: one(pharmacies, { fields: [prescriptions.pharmacyId], references: [pharmacies.id] }),
  pharmacist: one(pharmacists, { fields: [prescriptions.pharmacistId], references: [pharmacists.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true });
export const insertPharmacistSchema = createInsertSchema(pharmacists).omit({ id: true, createdAt: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });
export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({ id: true, createdAt: true });
export const insertMedicineSchema = createInsertSchema(medicines).omit({ id: true });
export const insertPharmacySchema = createInsertSchema(pharmacies).omit({ id: true, createdAt: true });
export const insertMedicineStockSchema = createInsertSchema(medicineStock).omit({ id: true, updatedAt: true });
export const insertSymptomCheckSchema = createInsertSchema(symptomChecks).omit({ id: true, createdAt: true });
export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({ id: true, createdAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Pharmacist = typeof pharmacists.$inferSelect;
export type InsertPharmacist = z.infer<typeof insertPharmacistSchema>;
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
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
