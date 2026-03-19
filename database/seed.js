// FILE: database/seed.js
// Run with:  node database/seed.js
// Seeds admin user + sample properties into MongoDB.

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const dotenv   = require('dotenv');
dotenv.config({ path: '../backend/.env' });

// Import models
const User     = require('../backend/models/User');
const Property = require('../backend/models/Property');
const Booking  = require('../backend/models/Booking');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ── Wipe existing data ──
  await Promise.all([User.deleteMany(), Property.deleteMany(), Booking.deleteMany()]);
  console.log('🗑  Cleared existing data');

  // ── Create users ──
  const hashedPw = await bcrypt.hash('demo123', 12);

  const [admin, student1, owner1] = await User.create([
    { name: 'Admin User',    email: 'admin@campustay.com',   password: hashedPw, role: 'admin'   },
    { name: 'Ananya Sharma', email: 'ananya@student.com',    password: hashedPw, role: 'student' },
    { name: 'Priya Nair',    email: 'priya@owner.com',       password: hashedPw, role: 'owner'   },
  ]);
  console.log(`👤 Users created: ${admin.email} | ${student1.email} | ${owner1.email}`);

  // ── Create properties ──
  const properties = await Property.create([
    {
      ownerId: owner1._id, name: 'Sunrise Girls PG', type: 'PG',
      address: '12, SV Road', city: 'Mumbai', pincode: '400058',
      lat: 19.136, lng: 72.826,
      price: 12000, gender: 'Girls', totalRooms: 8,
      amenities: ['WiFi', 'Meals', 'CCTV', 'Laundry'],
      description: 'Safe and comfortable PG with 24/7 CCTV, home-cooked meals, and high-speed WiFi.',
      rating: 4.8, isApproved: true,
    },
    {
      ownerId: owner1._id, name: 'Campus Corner Hostel', type: 'Hostel',
      address: 'Hiranandani Estate', city: 'Mumbai', pincode: '400076',
      lat: 19.127, lng: 72.906,
      price: 9500, gender: 'Boys', totalRooms: 15,
      amenities: ['WiFi', 'AC', 'Parking', 'CCTV'],
      description: 'Modern hostel next to IIT Bombay with spacious AC rooms and fast internet.',
      rating: 4.6, isApproved: true,
    },
    {
      ownerId: owner1._id, name: 'Green Valley PG', type: 'PG',
      address: '5, KP Lane', city: 'Pune', pincode: '411001',
      lat: 18.536, lng: 73.893,
      price: 14000, gender: 'Both', totalRooms: 6,
      amenities: ['WiFi', 'AC', 'Meals', 'Laundry', 'CCTV'],
      description: 'Premium fully-furnished PG in Koregaon Park with all amenities included.',
      rating: 4.9, isApproved: true,
    },
    {
      ownerId: owner1._id, name: 'Scholar Inn', type: 'Hostel',
      address: 'Baner Road', city: 'Pune', pincode: '411045',
      lat: 18.559, lng: 73.789,
      price: 8000, gender: 'Boys', totalRooms: 20,
      amenities: ['WiFi', 'Meals', 'Parking'],
      description: 'Affordable hostel near Symbiosis and IIIT Pune with community kitchen.',
      rating: 4.3, isApproved: true,
    },
    {
      ownerId: owner1._id, name: 'Lotus Stay', type: 'PG',
      address: 'HSR Layout Sector 2', city: 'Bangalore', pincode: '560102',
      lat: 12.912, lng: 77.640,
      price: 16500, gender: 'Girls', totalRooms: 4,
      amenities: ['WiFi', 'AC', 'Meals', 'CCTV', 'Laundry'],
      description: 'Luxury PG for girls in HSR Layout with premium finishes and power backup.',
      rating: 4.7, isApproved: true,
    },
  ]);
  console.log(`🏠 ${properties.length} properties created`);

  // ── Create a sample booking ──
  await Booking.create({
    studentId:  student1._id,
    propertyId: properties[0]._id,
    ownerId:    owner1._id,
    status:     'approved',
  });
  console.log('📋 Sample booking created');

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────');
  console.log('Login credentials (all use password: demo123)');
  console.log(`  Admin   → admin@campustay.com`);
  console.log(`  Student → ananya@student.com`);
  console.log(`  Owner   → priya@owner.com`);
  console.log('─────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
