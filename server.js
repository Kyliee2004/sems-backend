require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// CORS configuration - MUST be before other middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  // Allow additional headers used by frontend fetch (for cache control)
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Cache-Control',
    'Pragma',
    'Expires'
  ],
  credentials: false,
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

app.use(express.static('uploads')); // Serve uploaded files

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Use MongoDB Atlas URI from environment variable, fallback to local for development
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sems';

console.log('🔌 Attempting to connect to MongoDB...');
console.log('🔗 Connection string:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password in logs

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // 30 seconds timeout
  socketTimeoutMS: 45000,
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

const studentSchema = new mongoose.Schema({
  studentID: String,
  firstName: String,
  middleName: String,
  lastName: String,
  course: String,
  yearLevel: String,
  specificYear: String,
  contactNumber: String,
  email: String,
  username: String,
  password: String,
  address: String,
  profilePicture: String, // Add profile picture field
  resetCode: String,
  resetCodeExpiry: Date,
});

const Student = mongoose.model('Student', studentSchema);

// Teacher Schema
const teacherSchema = new mongoose.Schema({
  teacherID: String,
  firstName: String,
  middleName: String,
  lastName: String,
  department: String,
  position: String,
  contactNumber: String,
  email: { type: String, required: true }, // Make email required for notifications
  address: String,
  username: String,
  password: String,
  profilePicture: String,
  resetCode: String,
  resetCodeExpiry: Date,
});

const Teacher = mongoose.model('Teacher', teacherSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  adminID: String,
  firstName: String,
  middleName: String,
  lastName: String,
  email: { type: String, required: true }, // Required for notifications
  preferredEmail: String, // Admin's preferred email for password resets
  contactNumber: String,
  address: String,
  username: String,
  password: String,
  profilePicture: String,
  role: { type: String, default: 'admin' },
  resetCode: String, // For password reset
  resetCodeExpiry: Date, // Reset code expiration
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

// Exit Request Schema - Updated for dual approval system
const exitRequestSchema = new mongoose.Schema({
  studentID: String,
  studentType: String,
  firstName: String,
  lastName: String,
  course: String, // Added: student's course/department
  yearLevel: String, // Added: student's year level
  reasonForExit: String,
  date: String,
  time: String,
  emergencyContact: String,
  guardName: String,
  status: {
    type: String,
    enum: ['pending', 'admin_approved', 'teacher_approved', 'fully_approved', 'declined'],
    default: 'pending'
  },
  submittedAt: Date,
  adminApproval: {
    approved: { type: Boolean, default: false },
    adminResponse: String,
    respondedAt: Date
  },
  teacherApproval: {
    approved: { type: Boolean, default: false },
    teacherID: String,
    teacherResponse: String,
    respondedAt: Date
  },
  // Legacy fields for backward compatibility
  adminResponse: String,
  respondedAt: Date,
  approvedBy: String
});

const ExitRequest = mongoose.model('ExitRequest', exitRequestSchema);

// Admin Dashboard Schema
const adminDashboardSchema = new mongoose.Schema({
  requestId: String,
  studentName: String,
  studentID: String,
  reason: String,
  date: String,
  time: String,
  status: String,
  adminResponse: String,
  processedAt: Date,
  guardName: String,
  emergencyContact: String
});

const AdminDashboard = mongoose.model('AdminDashboard', adminDashboardSchema);

// Feedback/Complaint Schema
const feedbackSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  teacherID: { type: String, required: true },
  feedbackType: {
    type: String,
    enum: ['feedback', 'complaint'],
    required: true
  },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: function() { return this.feedbackType === 'feedback'; }
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  submittedAt: { type: Date, default: Date.now },
  adminResponse: String,
  respondedAt: Date,
  teacherResponse: String,
  teacherRespondedAt: Date
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SEMS Backend API is running',
    version: '1.0.1',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Setup endpoint - creates default admin account (REMOVE AFTER FIRST USE!)
app.post('/setup/create-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin account already exists!' });
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
    res.json({ 
      success: true,
      message: 'Admin account created successfully!',
      username: 'admin',
      password: 'admin123',
      warning: 'Please change the password after first login!'
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: error.message });
  }
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Smart Exit Monitoring System API',
    version: '1.0.0',
    endpoints: {
      students: '/students',
      teachers: '/teachers',
      admins: '/admins',
      exitRequests: '/exit-requests'
    }
  });
});

// Register a new student
app.post('/students', async (req, res) => {
  try {
    console.log('📝 Creating new student with data:', req.body);
    
    // CRITICAL FIX: Ensure specificYear is set for high school students
    const studentData = { ...req.body };
    if (studentData.yearLevel === 'Highschool' && !studentData.specificYear) {
      // If specificYear is not set for high school students, use the course (strand)
      studentData.specificYear = studentData.course;
      console.log('🏫 HIGH SCHOOL STUDENT FIX: Setting specificYear to course:', studentData.course);
    }
    
    console.log('📝 Final student data after processing:', {
      studentID: studentData.studentID,
      yearLevel: studentData.yearLevel,
      course: studentData.course,
      specificYear: studentData.specificYear,
      department: studentData.yearLevel === 'Highschool' ? 'Highschool' : 'College'
    });
    
    // Store the plain text password for email before hashing
    const plainTextPassword = studentData.password;
    const hashedPassword = await bcrypt.hash(studentData.password, 10);
    const student = new Student({ ...studentData, password: hashedPassword });
    await student.save();
    
    console.log('✅ Student created successfully:', {
      studentID: student.studentID,
      yearLevel: student.yearLevel,
      course: student.course,
      specificYear: student.specificYear
    });
    
    // Send welcome email to student
    try {
      const { sendStudentRegistrationEmail } = require('./emailConfig');
      const emailData = {
        ...studentData,
        password: plainTextPassword // Use plain text password for email
      };
      await sendStudentRegistrationEmail(emailData);
    } catch (emailError) {
      console.error('❌ Error sending student registration email:', emailError);
      // Don't fail the student creation if email fails
    }
    
    res.status(201).send(student);
  } catch (error) {
    console.error('❌ Error creating student:', error);
    res.status(400).send(error);
  }
});

// Login a student
app.post('/students/login', async (req, res) => {
  try {
    const student = await Student.findOne({ username: req.body.username });
    if (!student) {
      return res.status(400).send('Cannot find student');
    }
    const isMatch = await bcrypt.compare(req.body.password, student.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }
    const token = jwt.sign({ id: student._id }, 'your_jwt_secret');
    res.send({ student, token });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Submit exit request - Updated for dual approval system
app.post('/exit-requests', async (req, res) => {
  try {
    console.log('Received exit request data:', req.body);
    
    // Get student details to include course and year level
    const student = await Student.findOne({ studentID: req.body.studentID });
    if (!student) {
      return res.status(400).send('Student not found');
    }
    
    // Create exit request with additional student information
    const exitRequestData = {
      ...req.body,
      course: student.course || student.studentType,
      yearLevel: student.yearLevel || '',
      status: 'pending',
      submittedAt: new Date(),
      adminApproval: {
        approved: false,
        adminResponse: '',
        respondedAt: null
      },
      teacherApproval: {
        approved: false,
        teacherID: '',
        teacherResponse: '',
        respondedAt: null
      }
    };
    
    const exitRequest = new ExitRequest(exitRequestData);
    console.log('Created exit request object:', exitRequest);
    await exitRequest.save();
    console.log('Saved exit request successfully:', exitRequest);
    
    // Send email notifications to relevant teachers and admin
    try {
      const { notifyTeachersAboutExitRequest, notifyAdminAboutExitRequest } = require('./emailConfig');
      await notifyTeachersAboutExitRequest(exitRequest, Teacher);
      await notifyAdminAboutExitRequest(exitRequest, Admin);
      console.log('Email notifications sent successfully');
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(201).send(exitRequest);
  } catch (error) {
    console.error('Error saving exit request:', error);
    res.status(400).send(error);
  }
});

// Get all exit requests (for admin approval page)
app.get('/exit-requests', async (req, res) => {
  try {
    console.log('🚨 ADMIN ENDPOINT CALLED - GET /exit-requests (returns ALL requests)');
    console.log('🚨 URL Path:', req.path);
    console.log('🚨 Full URL:', req.url);
    console.log('🚨 User Agent:', req.get('User-Agent'));
    
    const exitRequests = await ExitRequest.find({}).sort({ submittedAt: -1 });
    
    console.log(`🚨 RETURNING ${exitRequests.length} requests (ALL STUDENTS)`);
    console.log('🚨 Request IDs:', exitRequests.map(req => `${req.studentID}-${req.guardName}`));
    
    // Populate profile pictures from student data
    const populatedRequests = await Promise.all(
      exitRequests.map(async (request) => {
        try {
          const student = await Student.findOne({ studentID: request.studentID });
          return {
            ...request.toObject(),
            profilePicture: student ? student.profilePicture : null
          };
        } catch (error) {
          console.error('Error fetching student data for exit request:', error);
          return request.toObject();
        }
      })
    );
    
    res.send(populatedRequests);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get exit requests for a specific student - ULTRA SECURE VERSION
app.get('/exit-requests/student/:studentID', async (req, res) => {
  try {
    const { studentID } = req.params;
    console.log('🔒 ULTRA SECURE ENDPOINT CALLED');
    console.log('🔒 Requested StudentID:', studentID);
    console.log('🔒 URL:', req.url);
    
    // STEP 1: Validate input
    if (!studentID || typeof studentID !== 'string' || studentID.trim() === '') {
      console.log('❌ Invalid studentID provided');
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    
    const targetStudentID = studentID.trim();
    console.log('🔒 Target StudentID:', targetStudentID);
    
    // STEP 2: Verify student exists
    const studentExists = await Student.findOne({ studentID: targetStudentID });
    if (!studentExists) {
      console.log('❌ Student not found in database');
      return res.status(404).json({ error: 'Student not found' });
    }
    
    console.log('✅ Student verified:', studentExists.firstName, studentExists.lastName);
    
    // STEP 3: Get ALL requests to debug
    const allRequests = await ExitRequest.find({});
    console.log(`🔍 DATABASE ANALYSIS: Total ${allRequests.length} requests found`);
    allRequests.forEach((req, i) => {
      const isMatch = req.studentID === targetStudentID;
      console.log(`   ${i+1}. StudentID:"${req.studentID}" Guard:"${req.guardName}" Match:${isMatch}`);
    });
    
    // STEP 4: ULTRA-STRICT filtering with EXACT student ID AND course matching
    console.log('🔒 IMPLEMENTING ULTRA-STRICT DEPARTMENT ISOLATION');
    console.log('🔒 Student Course:', studentExists.course);
    
    const validRequests = [];
    for (const request of allRequests) {
      // Convert both to strings and compare
      const reqStudentID = String(request.studentID).trim();
      const targetID = String(targetStudentID).trim();
      const reqCourse = String(request.course || '').trim().toUpperCase();
      const targetCourse = String(studentExists.course || '').trim().toUpperCase();
      
      console.log(`🔍 DETAILED COMPARISON:`);
      console.log(`   - Request StudentID: "${reqStudentID}"`);
      console.log(`   - Target StudentID: "${targetID}"`);
      console.log(`   - Request Course: "${reqCourse}"`);
      console.log(`   - Target Course: "${targetCourse}"`);
      
      const studentIDMatch = reqStudentID === targetID;
      const courseMatch = reqCourse === targetCourse;
      const isValidRequest = studentIDMatch && courseMatch;
      
      console.log(`   - Student ID Match: ${studentIDMatch}`);
      console.log(`   - Course Match: ${courseMatch}`);
      console.log(`   - FINAL RESULT: ${isValidRequest}`);
      
      if (isValidRequest) {
        console.log(`✅ APPROVED: Request belongs to exact student with matching course`);
        validRequests.push(request);
      } else {
        console.log(`❌ BLOCKED: Request does NOT belong to current student or different course/department`);
        if (!studentIDMatch) {
          console.log(`   🚨 SECURITY: Different Student ID`);
        }
        if (!courseMatch) {
          console.log(`   🚨 SECURITY: Different Course/Department - POTENTIAL CROSS-DEPARTMENT BREACH`);
        }
      }
    }
    
    console.log(`🔒 FINAL FILTER RESULT: ${validRequests.length} valid requests for student ${targetStudentID}`);
    
    // STEP 5: Final security check
    const finalCheck = validRequests.filter(req => String(req.studentID).trim() === String(targetStudentID).trim());
    if (finalCheck.length !== validRequests.length) {
      console.error('🚨 FINAL CHECK FAILED: Inconsistent results');
      return res.status(500).json({ error: 'Data integrity error' });
    }
    
    // STEP 6: Sort and add profile picture
    const sortedRequests = validRequests.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    const responseData = sortedRequests.map(request => ({
      ...request.toObject(),
      profilePicture: studentExists.profilePicture || null
    }));
    
    console.log(`🔒 SENDING RESPONSE: ${responseData.length} requests`);
    responseData.forEach((req, i) => {
      console.log(`   ${i+1}. StudentID:"${req.studentID}" Guard:"${req.guardName}"`);
    });
    
    res.json(responseData);
    
  } catch (error) {
    console.error('❌ Error in ultra secure student endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update exit request status (approve/decline) - Updated for dual approval system
app.put('/exit-requests/:id', async (req, res) => {
  try {
    const { status, adminResponse, teacherID, teacherResponse } = req.body;
    
    // Get current exit request
    const currentRequest = await ExitRequest.findById(req.params.id);
    if (!currentRequest) {
      return res.status(404).send('Exit request not found');
    }
    
    let updateData = {};
    
    if (teacherID) {
      // Teacher approval/decline
      updateData.teacherApproval = {
        approved: status === 'approved',
        teacherID,
        teacherResponse: teacherResponse || '',
        respondedAt: new Date()
      };
      
      // Check if admin has already approved
      if (currentRequest.adminApproval && currentRequest.adminApproval.approved && status === 'approved') {
        updateData.status = 'fully_approved';
      } else if (status === 'declined') {
        updateData.status = 'declined';
      } else {
        updateData.status = 'teacher_approved';
      }
      
      updateData.approvedBy = 'teacher';
    } else {
      // Admin approval/decline
      updateData.adminApproval = {
        approved: status === 'approved',
        adminResponse: adminResponse || '',
        respondedAt: new Date()
      };
      
      // Check if teacher has already approved
      if (currentRequest.teacherApproval && currentRequest.teacherApproval.approved && status === 'approved') {
        updateData.status = 'fully_approved';
      } else if (status === 'declined') {
        updateData.status = 'declined';
      } else {
        updateData.status = 'admin_approved';
      }
      
      updateData.approvedBy = 'admin';
      // Legacy field for backward compatibility
      updateData.adminResponse = adminResponse;
    }
    
    updateData.respondedAt = new Date();
    
    const exitRequest = await ExitRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    // Send confirmation emails
    if (teacherID) {
      try {
        const { sendTeacherConfirmationEmail } = require('./emailConfig');
        const teacher = await Teacher.findOne({ teacherID });
        
        if (teacher && teacher.email) {
          await sendTeacherConfirmationEmail(
            teacher.email,
            teacher.firstName + ' ' + teacher.lastName,
            exitRequest.firstName + ' ' + exitRequest.lastName,
            exitRequest.studentID,
            status,
            teacherResponse
          );
          console.log('Teacher confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending teacher confirmation email:', emailError);
      }
    }
    
    // Send security notification when request is fully approved
    if (exitRequest.status === 'fully_approved') {
      try {
        const { sendSecurityNotificationEmail } = require('./emailConfig');
        await sendSecurityNotificationEmail(
          exitRequest.firstName + ' ' + exitRequest.lastName,
          exitRequest.studentID,
          exitRequest.course,
          exitRequest.date,
          exitRequest.time,
          exitRequest.reasonForExit
        );
        console.log('🛡️ Security notification sent for fully approved request');
      } catch (emailError) {
        console.error('Error sending security notification:', emailError);
      }
    }
    
    res.send(exitRequest);
  } catch (error) {
    console.error('Error updating exit request:', error);
    res.status(500).send(error);
  }
});

// Clear approval history (delete ALL exit requests)
app.delete('/exit-requests/clear-history', async (req, res) => {
  try {
    console.log('🗑️ CLEAR HISTORY: Deleting all exit requests');
    
    // First, get count of all requests
    const totalCount = await ExitRequest.countDocuments({});
    console.log(`🗑️ Total requests before deletion: ${totalCount}`);
    
    // Delete ALL exit requests (including pending, approved, declined, etc.)
    const result = await ExitRequest.deleteMany({});
    
    console.log(`🗑️ Successfully deleted ${result.deletedCount} exit requests`);
    res.send({ 
      message: `Successfully cleared ${result.deletedCount} exit requests`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('🗑️ Error clearing history:', error);
    res.status(500).send(error);
  }
});

// Get exit requests for a specific teacher's department - SECURITY ENHANCED
app.get('/exit-requests/teacher/:teacherID', async (req, res) => {
  try {
    const { teacherID } = req.params;
    console.log('🔍 Teacher requesting exit requests:', teacherID);
    
    // Validate teacherID parameter
    if (!teacherID || teacherID.trim() === '') {
      console.log('❌ Invalid teacherID provided');
      return res.status(400).send('Invalid teacher ID');
    }
    
    // Find the teacher to get their department
    const teacher = await Teacher.findOne({ teacherID: teacherID.trim() });
    if (!teacher) {
      console.log('❌ Teacher not found:', teacherID);
      return res.status(404).send('Teacher not found');
    }
    
    console.log('👨‍🏫 Teacher found:');
    console.log('   Name:', teacher.firstName, teacher.lastName);
    console.log('   Department:', teacher.department);
    console.log('   Position:', teacher.position);
    
    // Get exit requests for students in the teacher's department ONLY
    // Show requests that need teacher approval (pending or admin_approved)
    let query = {};
    let departmentInfo = '';
    
    if (teacher.department === 'College') {
      // For college teachers, show requests from their specific course ONLY
      query = { 
        course: teacher.position, // teacher.position contains BSIT, HM, etc.
        status: { $in: ['pending', 'admin_approved'] }
      };
      departmentInfo = `College - ${teacher.position}`;
      console.log('📚 College teacher - filtering by course:', teacher.position);
    } else if (teacher.department === 'Highschool') {
      // CRITICAL FIX: For highschool teachers, show requests from their strand ONLY
      // High school teachers have position = STEM/TVL/HUMSS/ABM (the strand)
      // Exit requests from high school students have course = STEM/TVL/HUMSS/ABM
      query = { 
        course: teacher.position, // teacher.position contains STEM, TVL, HUMSS, ABM
        yearLevel: 'Highschool', // Ensure it's a high school student
        status: { $in: ['pending', 'admin_approved'] }
      };
      departmentInfo = `Highschool - ${teacher.position}`;
      console.log('🏫 HIGH SCHOOL TEACHER FIX: Filtering by strand (course):', teacher.position);
      console.log('🏫 Query will match: yearLevel="Highschool" AND course="' + teacher.position + '"');
    } else {
      console.log('❌ Unknown department:', teacher.department);
      return res.status(400).send('Invalid teacher department');
    }
    
    console.log('🔍 Database query:', JSON.stringify(query, null, 2));
    
    const exitRequests = await ExitRequest.find(query).sort({ submittedAt: -1 });
    
    console.log(`📋 Found ${exitRequests.length} exit requests for ${departmentInfo}`);
    console.log('📋 Request details:');
    exitRequests.forEach((req, index) => {
      console.log(`   ${index + 1}. Student: ${req.firstName} ${req.lastName} (${req.studentID})`);
      console.log(`      Course: ${req.course}, Year: ${req.yearLevel}`);
      console.log(`      Status: ${req.status}`);
    });
    
    // Security check: Verify all returned requests match the teacher's department
    const invalidRequests = exitRequests.filter(req => {
      if (teacher.department === 'College') {
        return req.course !== teacher.position;
      } else if (teacher.department === 'Highschool') {
        // CRITICAL FIX: For high school, check course (strand) not yearLevel
        return req.course !== teacher.position;
      }
      return true;
    });
    
    if (invalidRequests.length > 0) {
      console.error('🚨 SECURITY ALERT: Found requests not matching teacher department:', invalidRequests);
      return res.status(500).send('Data integrity error');
    }
    
    // Populate profile pictures from student data
    const populatedRequests = await Promise.all(
      exitRequests.map(async (request) => {
        try {
          const student = await Student.findOne({ studentID: request.studentID });
          return {
            ...request.toObject(),
            profilePicture: student ? student.profilePicture : null
          };
        } catch (error) {
          console.error('Error fetching exit request:', error);
          return request.toObject();
        }
      })
    );
    
    console.log(`✅ Returning ${populatedRequests.length} requests for teacher ${teacherID} (${departmentInfo})`);
    res.send(populatedRequests);
  } catch (error) {
    console.error('❌ Error fetching teacher exit requests:', error);
    res.status(500).send('Internal server error');
  }
});

// Rest of the endpoints remain the same...
// Add to admin dashboard
app.post('/admin-dashboard', async (req, res) => {
  try {
    const dashboardEntry = new AdminDashboard(req.body);
    await dashboardEntry.save();
    res.status(201).send(dashboardEntry);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get admin dashboard data
app.get('/admin-dashboard', async (req, res) => {
  try {
    const dashboardData = await AdminDashboard.find({}).sort({ processedAt: -1 });
    
    // Populate profile pictures from student data
    const populatedData = await Promise.all(
      dashboardData.map(async (entry) => {
        try {
          const student = await Student.findOne({ studentID: entry.studentID });
          return {
            ...entry.toObject(),
            profilePicture: student ? student.profilePicture : null
          };
        } catch (error) {
          console.error('Error fetching student data for dashboard entry:', error);
          return entry.toObject();
        }
      })
    );
    
    res.send(populatedData);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Bulk delete admin dashboard entries
app.delete('/admin-dashboard/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send({ message: 'Invalid or empty IDs array provided.' });
    }

    const result = await AdminDashboard.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: 'No matching records found to delete.' });
    }

    res.status(200).send({ message: `Successfully deleted ${result.deletedCount} records.` });
  } catch (error) {
    console.error('Error during bulk deletion of dashboard entries:', error);
    res.status(500).send({ message: 'Server error during bulk deletion.' });
  }
});

// Delete ALL admin dashboard logs (for "Clear History Logs" button)
app.delete('/admin-dashboard', async (req, res) => {
  try {
    const result = await AdminDashboard.deleteMany({});
    res.status(200).send({ message: `Cleared ${result.deletedCount} history logs.` });
  } catch (error) {
    res.status(500).send({ message: 'Failed to clear history logs.' });
  }
});

// Get all students
app.get('/students', async (req, res) => {
  try {
    console.log('GET /students endpoint called');
    const students = await Student.find({});
    console.log('Found students in database:', students);
    
    // Ensure profile pictures are included in the response
    const studentsWithPictures = students.map(student => ({
      ...student.toObject(),
      profilePicture: student.profilePicture || null
    }));
    
    console.log('Students with profile pictures:', studentsWithPictures.map(s => ({ studentID: s.studentID, profilePicture: s.profilePicture })));
    res.send(studentsWithPictures);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send(error);
  }
});

// Update student information
app.put('/students/:id', async (req, res) => {
  try {
    console.log('PUT /students/:id endpoint called with data:', req.body);
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // SECURITY: Prevent updating course and yearLevel to preserve student-teacher relationships
    if (updateData.course || updateData.yearLevel) {
      console.log('⚠️  Blocking attempt to update course/yearLevel for student preservation');
      delete updateData.course;
      delete updateData.yearLevel;
      console.log('🔒 Removed course and yearLevel from update data');
    }
    
    // Store original student data for email comparison
    const originalStudent = await Student.findById(id);
    if (!originalStudent) {
      return res.status(404).send('Student not found');
    }

    // If password is provided, hash it
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }
    
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).send('Student not found');
    }
    
    console.log('Student updated successfully:', updatedStudent);
    
    // Send update notification email to student
    try {
      const { sendStudentUpdateEmail } = require('./emailConfig');
      
      // Create updated fields object for email
      const updatedFields = {};
      Object.keys(updateData).forEach(key => {
        if (key !== 'password' && originalStudent[key] !== updateData[key]) {
          updatedFields[key] = updateData[key];
        }
      });
      
      // Add password change notification if password was updated
      if (updateData.password) {
        updatedFields.password = 'Password has been updated';
      }
      
      if (Object.keys(updatedFields).length > 0) {
        await sendStudentUpdateEmail(updatedStudent, updatedFields);
      }
    } catch (emailError) {
      console.error('❌ Error sending student update email:', emailError);
      // Don't fail the update if email fails
    }
    
    res.send(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).send(error);
  }
});

// Delete student
app.delete('/students/:id', async (req, res) => {
  try {
    console.log('DELETE /students/:id endpoint called for ID:', req.params.id);
    const { id } = req.params;
    
    const deletedStudent = await Student.findByIdAndDelete(id);
    
    if (!deletedStudent) {
      return res.status(404).send('Student not found');
    }
    
    console.log('Student deleted successfully:', deletedStudent);
    res.send({ message: 'Student deleted successfully', deletedStudent });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).send(error);
  }
});

// Get student profile by studentID
app.get('/students/profile/:studentID', async (req, res) => {
  try {
    console.log('GET /students/profile/:studentID endpoint called for ID:', req.params.studentID);
    const { studentID } = req.params;
    
    const student = await Student.findOne({ studentID });
    
    if (!student) {
      return res.status(404).send('Student not found');
    }
    
    console.log('Student profile found:', student);
    res.send(student);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).send(error);
  }
});

// Update student profile by studentID
app.put('/students/profile/:studentID', async (req, res) => {
  try {
    console.log('PUT /students/profile/:studentID endpoint called with data:', req.body);
    const { studentID } = req.params;
    const updateData = { ...req.body };

    // SECURITY: Prevent updating course and yearLevel to preserve student-teacher relationships
    if (updateData.course || updateData.yearLevel) {
      console.log('⚠️  Blocking attempt to update course/yearLevel for student profile preservation');
      delete updateData.course;
      delete updateData.yearLevel;
      console.log('🔒 Removed course and yearLevel from profile update data');
    }

    // Store original student data for email comparison
    const originalStudent = await Student.findOne({ studentID });
    if (!originalStudent) {
      return res.status(404).send('Student not found');
    }

    // Handle password update if provided
    if (updateData.newPassword) {
      const isValidPassword = await bcrypt.compare(updateData.currentPassword, originalStudent.password);
      if (!isValidPassword) {
        return res.status(400).send('Current password is incorrect');
      }
      const hashedPassword = await bcrypt.hash(updateData.newPassword, 10);
      updateData.password = hashedPassword;
      delete updateData.currentPassword;
      delete updateData.newPassword;
      delete updateData.confirmPassword;
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { studentID },
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedStudent) {
      return res.status(404).send('Student not found');
    }
    console.log('Student profile updated successfully:', updatedStudent);
    
    // Send update notification email to student
    try {
      const { sendStudentUpdateEmail } = require('./emailConfig');
      
      // Create updated fields object for email
      const updatedFields = {};
      Object.keys(updateData).forEach(key => {
        if (key !== 'password' && originalStudent[key] !== updateData[key]) {
          updatedFields[key] = updateData[key];
        }
      });
      
      // Add password change notification if password was updated
      if (updateData.password) {
        updatedFields.password = 'Password has been updated';
      }
      
      if (Object.keys(updatedFields).length > 0) {
        await sendStudentUpdateEmail(updatedStudent, updatedFields);
      }
    } catch (emailError) {
      console.error('❌ Error sending student update email:', emailError);
      // Don't fail the update if email fails
    }
    
    res.send(updatedStudent);
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).send(error);
  }
});

// Upload profile picture
app.post('/students/profile/:studentID/upload-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('POST /students/profile/:studentID/upload-picture endpoint called');
    const { studentID } = req.params;
    
    if (!req.file) {
      return res.status(400).send('No image file uploaded');
    }

    // Add timestamp to prevent caching issues
    const timestamp = Date.now();
    const imageUrl = `http://localhost:5000/${req.file.filename}?t=${timestamp}`;
    console.log('Image uploaded:', req.file.filename);
    console.log('Image URL:', imageUrl);

    // Update student profile with new image URL
    const updatedStudent = await Student.findOneAndUpdate(
      { studentID },
      { profilePicture: imageUrl },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).send('Student not found');
    }

    console.log('Profile picture updated successfully for student:', studentID);
    console.log('Updated student data:', updatedStudent);
    console.log('Profile picture field value:', updatedStudent.profilePicture);
    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePicture: imageUrl 
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).send('Error uploading profile picture');
  }
});

// Teacher Management Endpoints

// Create a new teacher
app.post('/teachers', async (req, res) => {
  try {
    const plainTextPassword = req.body.password;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const teacher = new Teacher({ ...req.body, password: hashedPassword });
    await teacher.save();

    // Send welcome email to teacher (non-blocking of account creation)
    try {
      const { sendTeacherRegistrationEmail } = require('./emailConfig');
      await sendTeacherRegistrationEmail({ ...req.body, password: plainTextPassword });
    } catch (emailErr) {
      console.error('❌ Error sending teacher registration email:', emailErr);
      // do not fail creation on email error
    }

    res.status(201).send(teacher);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all teachers
app.get('/teachers', async (req, res) => {
  try {
    console.log('GET /teachers endpoint called');
    const teachers = await Teacher.find({});
    console.log('Found teachers in database:', teachers);
    
    // Ensure profile pictures are included in the response
    const teachersWithPictures = teachers.map(teacher => ({
      ...teacher.toObject(),
      profilePicture: teacher.profilePicture || null
    }));
    
    console.log('Teachers with profile pictures:', teachersWithPictures.map(t => ({ teacherID: t.teacherID, profilePicture: t.profilePicture })));
    res.send(teachersWithPictures);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).send(error);
  }
});

// Login a teacher
app.post('/teachers/login', async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ username: req.body.username });
    if (!teacher) {
      return res.status(400).send('Cannot find teacher');
    }
    const isMatch = await bcrypt.compare(req.body.password, teacher.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }
    const token = jwt.sign({ id: teacher._id }, 'your_jwt_secret');
    res.send({ teacher, token });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update teacher information
app.put('/teachers/:id', async (req, res) => {
  try {
    console.log('PUT /teachers/:id endpoint called with data:', req.body);
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // SECURITY: Prevent updating department and position to preserve student-teacher relationships
    if (updateData.department || updateData.position) {
      console.log('⚠️  SECURITY ALERT: Blocking attempt to update department/position for teacher preservation');
      console.log('⚠️  Original department:', updateData.department);
      console.log('⚠️  Original position:', updateData.position);
      delete updateData.department;
      delete updateData.position;
      console.log('🔒 PROTECTED: Removed department and position from update data to preserve student assignments');
      console.log('🔒 REASON: Changing department/position would disconnect students from their teacher');
    }
    
    // If password is provided, hash it
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }
    
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedTeacher) {
      return res.status(404).send('Teacher not found');
    }

    console.log('Teacher updated successfully:', updatedTeacher);

    // Send teacher update email for changed fields (excluding password hash)
    try {
      const { sendTeacherUpdateEmail } = require('./emailConfig');
      const updatedFields = {};
      Object.keys(updateData).forEach((key) => {
        if (key !== 'password' && originalTeacher[key] !== updateData[key]) {
          updatedFields[key] = updateData[key];
        }
      });
      if (updateData.password) {
        updatedFields.password = 'Password has been updated';
      }
      if (Object.keys(updatedFields).length > 0) {
        await sendTeacherUpdateEmail(updatedTeacher, updatedFields);
      }
    } catch (emailErr) {
      console.error('❌ Error sending teacher update email:', emailErr);
    }

    res.send(updatedTeacher);
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).send(error);
  }
});

// Delete teacher
app.delete('/teachers/:id', async (req, res) => {
  try {
    console.log('DELETE /teachers/:id endpoint called for ID:', req.params.id);
    const { id } = req.params;
    
    const deletedTeacher = await Teacher.findByIdAndDelete(id);
    
    if (!deletedTeacher) {
      return res.status(404).send('Teacher not found');
    }
    
    console.log('Teacher deleted successfully:', deletedTeacher);
    res.send({ message: 'Teacher deleted successfully', deletedTeacher });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).send(error);
  }
});

// Get teacher profile by teacherID
app.get('/teachers/profile/:teacherID', async (req, res) => {
  try {
    console.log('GET /teachers/profile/:teacherID endpoint called for ID:', req.params.teacherID);
    const { teacherID } = req.params;
    
    const teacher = await Teacher.findOne({ teacherID });
    
    if (!teacher) {
      return res.status(404).send('Teacher not found');
    }
    
    console.log('Teacher profile found:', teacher);
    res.send(teacher);
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    res.status(500).send(error);
  }
});

// Update teacher profile by teacherID
app.put('/teachers/profile/:teacherID', async (req, res) => {
  try {
    console.log('PUT /teachers/profile/:teacherID endpoint called with data:', req.body);
    const { teacherID } = req.params;
    const updateData = { ...req.body };

    // Handle password update if provided
    if (updateData.newPassword) {
      const teacher = await Teacher.findOne({ teacherID });
      if (!teacher) {
        return res.status(404).send('Teacher not found');
      }
      const isValidPassword = await bcrypt.compare(updateData.currentPassword, teacher.password);
      if (!isValidPassword) {
        return res.status(400).send('Current password is incorrect');
      }
      const hashedPassword = await bcrypt.hash(updateData.newPassword, 10);
      updateData.password = hashedPassword;
      delete updateData.currentPassword;
      delete updateData.newPassword;
      delete updateData.confirmPassword;
    }

    // For diffing, fetch original teacher before update
    const originalTeacher = await Teacher.findOne({ teacherID });

    const updatedTeacher = await Teacher.findOneAndUpdate(
      { teacherID },
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedTeacher) {
      return res.status(404).send('Teacher not found');
    }
    console.log('Teacher profile updated successfully:', updatedTeacher);
    // Send teacher update email for changed fields
    try {
      const { sendTeacherUpdateEmail } = require('./emailConfig');
      const updatedFields = {};
      Object.keys(updateData).forEach((key) => {
        if (key !== 'password' && originalTeacher && originalTeacher[key] !== updateData[key]) {
          updatedFields[key] = updateData[key];
        }
      });
      if (updateData.password) {
        updatedFields.password = 'Password has been updated';
      }
      if (Object.keys(updatedFields).length > 0) {
        await sendTeacherUpdateEmail(updatedTeacher, updatedFields);
      }
    } catch (emailErr) {
      console.error('❌ Error sending teacher update email (profile):', emailErr);
    }

    res.send(updatedTeacher);
  } catch (error) {
    console.error('Error updating teacher profile:', error);
    res.status(500).send(error);
  }
});

// Upload teacher profile picture
app.post('/teachers/profile/:teacherID/upload-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('POST /teachers/profile/:teacherID/upload-picture endpoint called');
    const { teacherID } = req.params;
    
    if (!req.file) {
      return res.status(400).send('No image file uploaded');
    }

    // Add timestamp to prevent caching issues
    const timestamp = Date.now();
    const imageUrl = `http://localhost:5000/${req.file.filename}?t=${timestamp}`;
    console.log('Image uploaded:', req.file.filename);
    console.log('Image URL:', imageUrl);

    // Update teacher profile with new image URL
    const updatedTeacher = await Teacher.findOneAndUpdate(
      { teacherID },
      { profilePicture: imageUrl },
      { new: true }
    );

    if (!updatedTeacher) {
      return res.status(404).send('Teacher not found');
    }

    console.log('Profile picture updated successfully for teacher:', teacherID);
    console.log('Updated teacher data:', updatedTeacher);
    console.log('Profile picture field value:', updatedTeacher.profilePicture);
    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePicture: imageUrl 
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).send('Error uploading profile picture');
  }
});

// Admin Management Endpoints

// Create a new admin
app.post('/admins', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const admin = new Admin({ ...req.body, password: hashedPassword });
    await admin.save();
    res.status(201).send(admin);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all admins
app.get('/admins', async (req, res) => {
  try {
    console.log('GET /admins endpoint called');
    const admins = await Admin.find({});
    console.log('Found admins in database:', admins);
    
    // Ensure profile pictures are included in the response
    const adminsWithPictures = admins.map(admin => ({
      ...admin.toObject(),
      profilePicture: admin.profilePicture || null
    }));
    
    console.log('Admins with profile pictures:', adminsWithPictures.map(a => ({ adminID: a.adminID, profilePicture: a.profilePicture })));
    res.send(adminsWithPictures);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).send(error);
  }
});

// Login an admin
app.post('/admins/login', async (req, res) => {
  try {
    const admin = await Admin.findOne({ username: req.body.username });
    if (!admin) {
      return res.status(400).send('Cannot find admin');
    }
    const isMatch = await bcrypt.compare(req.body.password, admin.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }
    const token = jwt.sign({ id: admin._id }, 'your_jwt_secret');
    res.send({ admin, token });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update admin information
app.put('/admins/:id', async (req, res) => {
  try {
    console.log('PUT /admins/:id endpoint called with data:', req.body);
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // If password is provided, hash it
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }
    
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedAdmin) {
      return res.status(404).send('Admin not found');
    }
    
    console.log('Admin updated successfully:', updatedAdmin);
    res.send(updatedAdmin);
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).send(error);
  }
});

// Delete admin
app.delete('/admins/:id', async (req, res) => {
  try {
    console.log('DELETE /admins/:id endpoint called for ID:', req.params.id);
    const { id } = req.params;
    
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    
    if (!deletedAdmin) {
      return res.status(404).send('Admin not found');
    }
    
    console.log('Admin deleted successfully:', deletedAdmin);
    res.send({ message: 'Admin deleted successfully', deletedAdmin });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).send(error);
  }
});

// Get admin profile by adminID
app.get('/admins/profile/:adminID', async (req, res) => {
  try {
    console.log('GET /admins/profile/:adminID endpoint called for ID:', req.params.adminID);
    const { adminID } = req.params;
    
    const admin = await Admin.findOne({ adminID });
    
    if (!admin) {
      return res.status(404).send('Admin not found');
    }
    
    console.log('Admin profile found:', admin);
    res.send(admin);
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).send(error);
  }
});

// Update admin profile by adminID
app.put('/admins/profile/:adminID', async (req, res) => {
  try {
    console.log('PUT /admins/profile/:adminID endpoint called with data:', req.body);
    const { adminID } = req.params;
    const updateData = { ...req.body };

    // Handle password update if provided
    if (updateData.newPassword) {
      const admin = await Admin.findOne({ adminID });
      if (!admin) {
        return res.status(404).send('Admin not found');
      }
      const isValidPassword = await bcrypt.compare(updateData.currentPassword, admin.password);
      if (!isValidPassword) {
        return res.status(400).send('Current password is incorrect');
      }
      const hashedPassword = await bcrypt.hash(updateData.newPassword, 10);
      updateData.password = hashedPassword;
      delete updateData.currentPassword;
      delete updateData.newPassword;
      delete updateData.confirmPassword;
    }

    const updatedAdmin = await Admin.findOneAndUpdate(
      { adminID },
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedAdmin) {
      return res.status(404).send('Admin not found');
    }
    console.log('Admin profile updated successfully:', updatedAdmin);
    res.send(updatedAdmin);
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).send(error);
  }
});

// Upload admin profile picture
app.post('/admins/profile/:adminID/upload-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('POST /admins/profile/:adminID/upload-picture endpoint called');
    const { adminID } = req.params;
    
    if (!req.file) {
      return res.status(400).send('No image file uploaded');
    }

    // Add timestamp to prevent caching issues
    const timestamp = Date.now();
    const imageUrl = `http://localhost:5000/${req.file.filename}?t=${timestamp}`;
    console.log('Image uploaded:', req.file.filename);
    console.log('Image URL:', imageUrl);

    // Update admin profile with new image URL
    const updatedAdmin = await Admin.findOneAndUpdate(
      { adminID },
      { profilePicture: imageUrl },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).send('Admin not found');
    }

    console.log('Profile picture updated successfully for admin:', adminID);
    console.log('Updated admin data:', updatedAdmin);
    console.log('Profile picture field value:', updatedAdmin.profilePicture);
    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePicture: imageUrl 
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).send('Error uploading profile picture');
  }
});

// Admin password reset request
app.post('/admin/forgot-password', async (req, res) => {
  try {
    console.log('--- ADMIN FORGOT PASSWORD ENDPOINT TRIGGERED ---');
    const { username } = req.body;
    console.log(`1. Received username: ${username}`);

    if (!username) {
      console.log('❌ Error: Username is required');
      return res.status(400).json({ message: 'Username is required' });
    }

    // Find the admin account
    const admin = await Admin.findOne({ username: username });
    if (!admin) {
      console.log(`❌ Error: Admin account not found for username: ${username}`);
      return res.status(404).json({ message: 'Admin account not found' });
    }
    console.log('2. Found admin document in database:', admin);

    const targetEmail = admin.preferredEmail || admin.email;
    console.log(`3. Default email: ${admin.email}`);
    console.log(`4. Preferred email: ${admin.preferredEmail}`);
    console.log(`5. Final target email for reset code: ${targetEmail}`);

    if (!targetEmail) {
      console.log('❌ Error: No email address (default or preferred) is associated with this admin account.');
      return res.status(400).json({ message: 'No email address associated with this admin account' });
    }

    // Generate a 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`6. Generated reset code: ${resetCode}`);
    
    // Store reset code with expiration (15 minutes)
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    
    // Update admin with reset code and expiry
    await Admin.findOneAndUpdate(
      { adminID: admin.adminID },
      { 
        resetCode: resetCode,
        resetCodeExpiry: resetExpiry
      }
    );
    console.log('7. Saved reset code to the database.');

    // Send password reset email
    try {
      const { sendAdminPasswordResetEmail } = require('./emailConfig');
      const adminForEmail = { ...admin.toObject(), email: targetEmail };
      console.log('8. Calling sendAdminPasswordResetEmail function with:', adminForEmail);
      await sendAdminPasswordResetEmail(adminForEmail, resetCode);
      console.log('9. Successfully called sendAdminPasswordResetEmail function.');
    } catch (emailError) {
      console.error('❌ Error sending password reset email:', emailError);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    console.log('✅ Password reset code sent to admin email');
    res.json({ 
      message: 'Password reset code sent to your email address',
      email: targetEmail // Use targetEmail for confirmation
    });

  } catch (error) {
    console.error('Error processing password reset request:', error);
    res.status(500).json({ message: 'An error occurred while processing your request' });
  }
});

// Admin password reset confirmation
app.post('/admin/reset-password', async (req, res) => {
  try {
    console.log('POST /admin/reset-password endpoint called');
    const { username, resetCode, newPassword } = req.body;

    if (!username || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Username, reset code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Find the admin account
    const admin = await Admin.findOne({ username: username });
    if (!admin) {
      return res.status(404).json({ message: 'Admin account not found' });
    }

    // Check if reset code exists and is valid
    if (!admin.resetCode || !admin.resetCodeExpiry) {
      return res.status(400).json({ message: 'No password reset request found' });
    }

    // Check if reset code has expired
    if (new Date() > admin.resetCodeExpiry) {
      return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
    }

    // Verify reset code
    if (admin.resetCode !== resetCode) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset code
    await Admin.findOneAndUpdate(
      { adminID: admin.adminID },
      { 
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null
      }
    );

    console.log('✅ Admin password reset successfully');
    res.json({ message: 'Password reset successfully. You can now login with your new password.' });

  } catch (error) {
    console.error('Error resetting admin password:', error);
    res.status(500).json({ message: 'An error occurred while resetting your password' });
  }
});


// Test endpoint to verify server is running updated code
app.get('/test-debug', (req, res) => {
  console.log('🧪 TEST DEBUG ENDPOINT CALLED');
  res.json({ message: 'Debug endpoint working', timestamp: new Date().toISOString() });
});

// Student password reset request - EXACT COPY OF ADMIN FLOW
app.post('/students/forgot-password', async (req, res) => {
  try {
    console.log('POST /students/forgot-password endpoint called');
    const { username } = req.body;
    console.log('Request body:', req.body);

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Find the student account
    const student = await Student.findOne({ username: username });
    console.log('Student found:', student);
    if (!student) {
      return res.status(404).json({ message: 'Student account not found' });
    }

    if (!student.email) {
      return res.status(400).json({ message: 'No email address associated with this student account' });
    }

    // Generate a 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated reset code:', resetCode);
    
    // Store reset code with expiration (15 minutes)
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    console.log('Reset code expiry:', resetExpiry);
    
    // Update student with reset code and expiry
    const updateResult = await Student.findOneAndUpdate(
      { username: student.username },
      { 
        resetCode: resetCode,
        resetCodeExpiry: resetExpiry
      },
      { new: true }
    );
    console.log('Update result:', updateResult);

    // Send password reset email
    try {
      const { sendStudentPasswordResetEmail } = require('./emailConfig');
      await sendStudentPasswordResetEmail(student, resetCode);
      console.log('Password reset email sent successfully.');
    } catch (emailError) {
      console.error('❌ Error sending password reset email:', emailError);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    console.log('✅ Password reset code sent to student email');
    res.json({ 
      message: 'Password reset code sent to your email address',
      email: student.email // For confirmation
    });

  } catch (error) {
    console.error('Error processing student password reset request:', error);
    res.status(500).json({ message: 'An error occurred while processing your request' });
  }
});

// Student password reset confirmation - EXACT COPY OF ADMIN FLOW
app.post('/students/reset-password', async (req, res) => {
  try {
    console.log('POST /students/reset-password endpoint called');
    const { username, resetCode, newPassword } = req.body;
    console.log('Request body:', req.body);

    if (!username || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Username, reset code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Find the student account
    const student = await Student.findOne({ username: username });
    console.log('Student found:', student);
    if (!student) {
      return res.status(404).json({ message: 'Student account not found' });
    }

    console.log('Student reset code from DB:', student.resetCode);
    console.log('Student reset code expiry from DB:', student.resetCodeExpiry);

    // Check if reset code exists and is valid
    if (!student.resetCode || !student.resetCodeExpiry) {
      return res.status(400).json({ message: 'No password reset request found' });
    }

    // Check if reset code has expired
    if (new Date() > student.resetCodeExpiry) {
      return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
    }

    // Verify reset code
    if (student.resetCode !== resetCode) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset code
    await Student.findOneAndUpdate(
      { username: student.username },
      { 
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null
      }
    );

    console.log('✅ Student password reset successfully');
    res.json({ message: 'Password reset successfully. You can now login with your new password.' });

  } catch (error) {
    console.error('Error resetting student password:', error);
    res.status(500).json({ message: 'An error occurred while resetting your password' });
  }
});

// Teacher password reset request - EXACT COPY OF ADMIN FLOW
app.post('/teachers/forgot-password', async (req, res) => {
  try {
    console.log('POST /teachers/forgot-password endpoint called');
    const { username } = req.body;
    console.log('Request body:', req.body);

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Find the teacher account
    const teacher = await Teacher.findOne({ username: username });
    console.log('Teacher found:', teacher);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher account not found' });
    }

    if (!teacher.email) {
      return res.status(400).json({ message: 'No email address associated with this teacher account' });
    }

    // Generate a 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated reset code:', resetCode);
    
    // Store reset code with expiration (15 minutes)
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    console.log('Reset code expiry:', resetExpiry);
    
    // Update teacher with reset code and expiry
    const updateResult = await Teacher.findOneAndUpdate(
      { username: teacher.username },
      { 
        resetCode: resetCode,
        resetCodeExpiry: resetExpiry
      },
      { new: true }
    );
    console.log('Update result:', updateResult);

    // Send password reset email
    try {
      const { sendTeacherPasswordResetEmail } = require('./emailConfig');
      await sendTeacherPasswordResetEmail(teacher, resetCode);
      console.log('Password reset email sent successfully.');
    } catch (emailError) {
      console.error('❌ Error sending password reset email:', emailError);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    console.log('✅ Password reset code sent to teacher email');
    res.json({ 
      message: 'Password reset code sent to your email address',
      email: teacher.email // For confirmation
    });

  } catch (error) {
    console.error('Error processing teacher password reset request:', error);
    res.status(500).json({ message: 'An error occurred while processing your request' });
  }
});

// Teacher password reset confirmation - EXACT COPY OF ADMIN FLOW
app.post('/teachers/reset-password', async (req, res) => {
  try {
    console.log('POST /teachers/reset-password endpoint called');
    const { username, resetCode, newPassword } = req.body;
    console.log('Request body:', req.body);

    if (!username || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Username, reset code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Find the teacher account
    const teacher = await Teacher.findOne({ username: username });
    console.log('Teacher found:', teacher);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher account not found' });
    }

    console.log('Teacher reset code from DB:', teacher.resetCode);
    console.log('Teacher reset code expiry from DB:', teacher.resetCodeExpiry);

    // Check if reset code exists and is valid
    if (!teacher.resetCode || !teacher.resetCodeExpiry) {
      return res.status(400).json({ message: 'No password reset request found' });
    }

    // Check if reset code has expired
    if (new Date() > teacher.resetCodeExpiry) {
      return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
    }

    // Verify reset code
    if (teacher.resetCode !== resetCode) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset code
    await Teacher.findOneAndUpdate(
      { username: teacher.username },
      { 
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null
      }
    );

    console.log('✅ Teacher password reset successfully');
    res.json({ message: 'Password reset successfully. You can now login with your new password.' });

  } catch (error) {
    console.error('Error resetting teacher password:', error);
    res.status(500).json({ message: 'An error occurred while resetting your password' });
  }
});



// Change admin password
app.put('/admin/change-password', async (req, res) => {
  try {
    console.log('PUT /admin/change-password endpoint called');
    console.log('Request body:', req.body);
    const { currentPassword, newPassword, adminEmail } = req.body;

    if (!currentPassword || !newPassword) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (!adminEmail) {
      console.log('Admin email is required');
      return res.status(400).json({ message: 'Admin email is required for password change notifications' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      console.log('Invalid email format');
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (newPassword.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Find the single admin account
    console.log('Looking for admin with username: admin');
    const admin = await Admin.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('Admin not found in database');
      return res.status(404).json({ message: 'Admin account not found' });
    }

    console.log('Admin found:', admin.username);

    // Verify current password
    console.log('Verifying current password...');
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
    if (!isValidPassword) {
      console.log('Current password is incorrect');
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    console.log('Current password is valid, proceeding with password change...');

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and store admin's preferred email
    await Admin.findOneAndUpdate(
      { username: 'admin' },
      { 
        password: hashedPassword,
        preferredEmail: adminEmail // Store the admin's preferred email for password resets
      }
    );

    console.log('Admin password changed successfully');
    
    // Send email notification
    try {
      const { sendAdminPasswordChangeNotification } = require('./emailConfig');
      const adminName = admin.firstName && admin.lastName ? `${admin.firstName} ${admin.lastName}` : admin.username || 'Administrator';
      await sendAdminPasswordChangeNotification(adminName, adminEmail);
      console.log('✅ Password change notification sent successfully');
    } catch (emailError) {
      console.error('❌ Error sending password change notification:', emailError);
      // Don't fail the password change if email fails
    }
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing admin password:', error);
    res.status(500).json({ message: 'An error occurred while changing password' });
  }
});

// Keep-alive: Ping self every 10 minutes to prevent Render from sleeping
const RENDER_URL = process.env.RENDER_URL || 'https://sems-backend-d5op.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

if (process.env.NODE_ENV === 'production') {
  setInterval(async () => {
    try {
      const https = require('https');
      https.get(RENDER_URL, (res) => {
        console.log(`🏓 Keep-alive ping: ${res.statusCode}`);
      }).on('error', (err) => {
        console.error('❌ Keep-alive ping failed:', err.message);
      });
    } catch (error) {
      console.error('❌ Keep-alive error:', error);
    }
  }, PING_INTERVAL);
  
  console.log('✅ Keep-alive service started - pinging every 10 minutes');
}

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// MongoDB connection error handling
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

// Start the server (must be at the end after all routes are defined)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 MongoDB URI: ${MONGODB_URI ? 'Configured' : 'Not configured'}`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});