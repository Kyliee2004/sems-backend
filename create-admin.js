require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sems';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Admin Schema
const adminSchema = new mongoose.Schema({
  adminID: String,
  firstName: String,
  middleName: String,
  lastName: String,
  position: String,
  contactNumber: String,
  email: String,
  address: String,
  username: String,
  password: String,
  profilePicture: String,
  resetCode: String,
  resetCodeExpiry: Date,
});

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      console.log('Username: admin');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin
    const admin = new Admin({
      adminID: 'ADM001',
      firstName: 'System',
      middleName: '',
      lastName: 'Administrator',
      position: 'System Admin',
      contactNumber: '09123456789',
      email: 'admin@sems.edu',
      address: 'System',
      username: 'admin',
      password: hashedPassword,
      profilePicture: '',
    });

    await admin.save();
    console.log('✅ Admin account created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
