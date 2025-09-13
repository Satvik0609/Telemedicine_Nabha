import { db } from './db';
import { users, doctors, medicines, pharmacies } from '@shared/schema-sqlite';

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create sample data
    const sampleUser = await db.insert(users).values({
      firebaseUid: 'sample-user-123',
      email: 'patient@sehatsetu.com',
      name: 'Sample Patient',
      phone: '+91-9876543210',
      role: 'patient',
      isActive: true,
      gender: 'male',
      address: 'Nabha, Punjab, India',
      createdAt: new Date()
    }).returning();

    const sampleDoctor = await db.insert(doctors).values({
      userId: sampleUser[0].id,
      specialty: 'General Medicine',
      qualification: 'MBBS, MD',
      experience: 10,
      rating: 4.5,
      totalRatings: 100,
      isOnline: true,
      consultationFee: 500,
      languages: JSON.stringify(['Hindi', 'Punjabi', 'English']),
      licenseNumber: 'MCI-12345',
      isActive: true
    }).returning();

    const sampleMedicine = await db.insert(medicines).values({
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      dosage: '500mg',
      manufacturer: 'Sun Pharma',
      price: 25,
      description: 'Pain relief and fever reducer',
      form: 'Tablet'
    }).returning();

    const samplePharmacy = await db.insert(pharmacies).values({
      name: 'Nabha Medical Store',
      address: 'Main Market, Nabha, Punjab',
      phone: '+91-9876543211',
      latitude: '30.3753',
      longitude: '76.1522',
      isActive: true,
      licenseNumber: 'PH-12345',
      createdAt: new Date()
    }).returning();

    console.log('Database initialized successfully!');
    console.log('Sample data created:');
    console.log('- User:', sampleUser[0].name);
    console.log('- Doctor:', sampleDoctor[0].specialty);
    console.log('- Medicine:', sampleMedicine[0].name);
    console.log('- Pharmacy:', samplePharmacy[0].name);
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export { initializeDatabase };
