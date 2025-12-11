const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sems_admin:admin1@sems.nwxmnau.mongodb.net/sems?retryWrites=true&w=majority');

// Define Admin Schema (same as in your server.js)
const adminSchema = new mongoose.Schema({
  adminID: String,
  firstName: String,
  middleName: String,
  lastName: String,
  email: { type: String, required: true },
  preferredEmail: String,
  contactNumber: String,
  address: String,
  username: String,
  password: String,
  profilePicture: String,
  role: { type: String, default: 'admin' },
  resetCode: String,
  resetCodeExpiry: Date,
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

// Seed function
async function seedDatabase() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('456123', 10);

    // Create admin user
    const admin = new Admin({
      adminID: 'ADMIN001',
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@sems.com',
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: 456123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
