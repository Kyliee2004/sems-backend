const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  // Gmail SMTP settings
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'your-email@gmail.com', // Replace with your Gmail
    pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password' // Replace with your app password
  }
};

// Department-specific Gmail addresses
const departmentEmails = {
  // College Departments
  BSIT: process.env.BSIT_TEACHER_EMAIL || 'bsit.teacher@gmail.com',
  EDUC: process.env.EDUC_TEACHER_EMAIL || 'educ.teacher@gmail.com',
  ENTREP: process.env.ENTREP_TEACHER_EMAIL || 'entrep.teacher@gmail.com',
  BSHM: process.env.BSHM_TEACHER_EMAIL || 'bshm.teacher@gmail.com',
  
  // Highschool Strands
  STEM: process.env.STEM_TEACHER_EMAIL || 'stem.teacher@gmail.com',
  HUMSS: process.env.HUMSS_TEACHER_EMAIL || 'hums.teacher@gmail.com',
  TVL: process.env.TVL_TEACHER_EMAIL || 'tvl.teacher@gmail.com',
  ABM: process.env.ABM_TEACHER_EMAIL || 'abm.teacher@gmail.com'
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Email templates
const emailTemplates = {
  // Student registration welcome email
  studentRegistrationWelcome: (studentName, studentID, username, password, email) => ({
    subject: `🎉 Welcome to Smart Exit Monitoring System - Account Created Successfully!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #27ae60; margin: 0; font-size: 24px;">🎉 Welcome to Smart Exit Monitoring System!</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">Your student account has been successfully created</p>
          </div>
          
          <div style="background-color: #d5f4e6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #27ae60; margin: 0 0 15px 0; font-size: 18px;">Hello ${studentName},</h2>
            <p style="color: #2c3e50; margin: 0; line-height: 1.6;">
              Congratulations! Your student account has been successfully created in the Smart Exit Monitoring System. 
              You can now access the system using your login credentials below.
            </p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 16px;">🔐 Your Login Credentials</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404; width: 40%;">Student ID:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404; font-family: monospace;">${studentID}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404;">Username:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404; font-family: monospace;">${username}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #856404;">Password:</td>
                <td style="padding: 8px 0; color: #856404; font-family: monospace; background-color: #f8f9fa;">${password}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 16px;">📱 How to Access the System</h3>
            <ol style="color: #2c3e50; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Visit the Smart Exit Monitoring System website</li>
              <li>Click on "Student Login"</li>
              <li>Enter your username and password (shown above)</li>
              <li>Click "Login" to access your dashboard</li>
            </ol>
          </div>
          
          <div style="background-color: #f3e5f5; border: 1px solid #ce93d8; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #7b1fa2; margin: 0 0 15px 0; font-size: 16px;">🔒 Security Reminder</h3>
            <p style="color: #2c3e50; margin: 0; line-height: 1.6;">
              <strong>Important:</strong> For security reasons, please change your password after your first login. 
              You can do this by going to your profile settings once you're logged in.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
              If you have any questions or need assistance, please contact your teacher or the system administrator.
            </p>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 12px;">
              This is an automated message from the Smart Exit Monitoring System.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Teacher registration welcome email
  teacherRegistrationWelcome: (teacherName, teacherID, username, password, email) => ({
    subject: `🎉 Welcome to Smart Exit Monitoring System - Teacher Account Created!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #27ae60; margin: 0; font-size: 24px;">🎉 Welcome to Smart Exit Monitoring System!</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">Your teacher account has been successfully created</p>
          </div>
          <div style="background-color: #d5f4e6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #27ae60; margin: 0 0 15px 0; font-size: 18px;">Hello ${teacherName},</h2>
            <p style="color: #2c3e50; margin: 0; line-height: 1.6;">
              Your teacher account has been successfully created in the Smart Exit Monitoring System.
              You can now access the system using your login credentials below.
            </p>
          </div>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 16px;">🔐 Your Login Credentials</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404; width: 40%;">Teacher ID:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404; font-family: monospace;">${teacherID}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404;">Username:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404; font-family: monospace;">${username}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #856404;">Password:</td>
                <td style="padding: 8px 0; color: #856404; font-family: monospace; background-color: #f8f9fa;">${password}</td>
              </tr>
            </table>
          </div>
          <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 16px;">📱 How to Access the System</h3>
            <ol style="color: #2c3e50; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Visit the Smart Exit Monitoring System website</li>
              <li>Click on "Login"</li>
              <li>Enter your username and password (shown above)</li>
              <li>Click "Login" to access your dashboard</li>
            </ol>
          </div>
          <div style="background-color: #f3e5f5; border: 1px solid #ce93d8; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #7b1fa2; margin: 0 0 15px 0; font-size: 16px;">🔒 Security Reminder</h3>
            <p style="color: #2c3e50; margin: 0; line-height: 1.6;">
              <strong>Important:</strong> For security reasons, please change your password after your first login.
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
              If you have any questions or need assistance, please contact the system administrator.
            </p>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 12px;">
              This is an automated message from the Smart Exit Monitoring System.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Admin password reset email
  adminPasswordReset: (adminName, resetCode, email) => ({
    subject: `🔐 Admin Password Reset - Smart Exit Monitoring System`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e74c3c; margin: 0; font-size: 24px;">🔐 Password Reset Request</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">Smart Exit Monitoring System</p>
          </div>
          
          <div style="background-color: #fdf2f2; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #e74c3c; margin: 0 0 15px 0; font-size: 18px;">Hello ${adminName},</h2>
            <p style="color: #2c3e50; margin: 0; line-height: 1.6;">
              A password reset request has been made for your admin account. If you did not request this, please ignore this email.
            </p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 16px;">🔑 Your Reset Code</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin: 15px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #2c3e50; font-family: monospace; letter-spacing: 2px;">${resetCode}</span>
            </div>
            <p style="color: #856404; margin: 0; font-size: 14px;">
              Use this code to reset your password. This code will expire in 15 minutes.
            </p>
          </div>
          
          <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 16px;">📱 How to Reset Your Password</h3>
            <ol style="color: #2c3e50; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Go to the Smart Exit Monitoring System login page</li>
              <li>Click on "Forgot Password?" or "Reset Password"</li>
              <li>Enter your admin username: <strong>admin</strong></li>
              <li>Enter the reset code: <strong>${resetCode}</strong></li>
              <li>Enter your new password</li>
              <li>Confirm your new password</li>
              <li>Click "Reset Password"</li>
            </ol>
          </div>
          
          <div style="background-color: #f3e5f5; border: 1px solid #ce93d8; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #7b1fa2; margin: 0 0 15px 0; font-size: 16px;">🔒 Security Notice</h3>
            <p style="color: #2c3e50; margin: 0; line-height: 1.6;">
              <strong>Important:</strong> This reset code is valid for 15 minutes only. 
              If you did not request this password reset, please contact the system administrator immediately.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
              If you have any questions or need assistance, please contact the system administrator.
            </p>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 12px;">
              This is an automated message from the Smart Exit Monitoring System.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Student account update notification
  studentAccountUpdate: (studentName, studentID, updatedFields, email) => ({
    subject: `📝 Account Information Updated - Smart Exit Monitoring System`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f39c12; margin: 0; font-size: 24px;">📝 Account Information Updated</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">Smart Exit Monitoring System</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">Hello ${studentName},</h2>
            <p style="color: #2c3e50; margin: 0; line-height: 1.6;">
              Your account information has been successfully updated in the Smart Exit Monitoring System.
            </p>
          </div>
          
          <div style="background-color: #e8f5e8; border: 1px solid #c8e6c9; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 16px;">✅ Updated Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #c8e6c9; font-weight: bold; color: #2e7d32; width: 40%;">Student ID:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #c8e6c9; color: #2e7d32;">${studentID}</td>
              </tr>
              ${Object.entries(updatedFields).map(([field, value]) => `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #c8e6c9; font-weight: bold; color: #2e7d32;">${field.charAt(0).toUpperCase() + field.slice(1)}:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #c8e6c9; color: #2e7d32;">${value}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          
          <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 16px;">🔐 Security Notice</h3>
            <p style="color: #2c3e50; margin: 0; line-height: 1.6;">
              If you did not make these changes, please contact your teacher or system administrator immediately. 
              For security reasons, we recommend changing your password if it was updated.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
              If you have any questions about these changes, please contact your teacher or the system administrator.
            </p>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 12px;">
              This is an automated message from the Smart Exit Monitoring System.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  exitRequestNotification: (teacherName, studentName, studentID, course, yearLevel, reason, date, time) => ({
    subject: `🚨 New Exit Request from ${studentName} (${studentID})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e74c3c; margin: 0; font-size: 24px;">🚨 Exit Request Notification</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">Smart Exit Monitoring System</p>
          </div>
          
          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">Hello ${teacherName},</h2>
            <p style="color: #34495e; margin: 0; line-height: 1.6;">
              A student from your department has submitted an exit request that requires your attention.
            </p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 16px;">📋 Request Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404; width: 40%;">Student Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404;">${studentName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404;">Student ID:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404;">${studentID}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404;">Course/Year:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404;">${course} ${yearLevel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404;">Reason for Exit:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404;">${reason}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404;">Date:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #856404;">Time:</td>
                <td style="padding: 8px 0; color: #856404;">${time}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #0c5460; margin: 0 0 15px 0; font-size: 16px;">⚡ Action Required</h3>
            <p style="color: #0c5460; margin: 0; line-height: 1.6;">
              Please review this exit request and approve or decline it through the Teacher Approval Page.
            </p>
            <p style="color: #0c5460; margin: 10px 0 0 0; line-height: 1.6;">
              <strong>Note:</strong> This request is also visible to administrators for oversight.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/teacher-approval" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              📝 Review Request
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; margin: 0; font-size: 12px;">
              This is an automated notification from the Smart Exit Monitoring System.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `
  }),
  
  exitRequestUpdate: (teacherName, studentName, studentID, status, response) => ({
    subject: `✅ Exit Request ${status} - ${studentName} (${studentID})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${status === 'approved' ? '#27ae60' : '#e74c3c'}; margin: 0; font-size: 24px;">
              ${status === 'approved' ? '✅' : '❌'} Exit Request ${status.charAt(0).toUpperCase() + status.slice(1)}
            </h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">Smart Exit Monitoring System</p>
          </div>
          
          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">Hello ${teacherName},</h2>
            <p style="color: #34495e; margin: 0; line-height: 1.6;">
              You have successfully ${status} an exit request. Here are the details:
            </p>
          </div>
          
          <div style="background-color: ${status === 'approved' ? '#d4edda' : '#f8d7da'}; border: 1px solid ${status === 'approved' ? '#c3e6cb' : '#f5c6cb'}; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: ${status === 'approved' ? '#155724' : '#721c24'}; margin: 0 0 15px 0; font-size: 16px;">📋 Request Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid ${status === 'approved' ? '#c3e6cb' : '#f5c6cb'}; font-weight: bold; color: ${status === 'approved' ? '#155724' : '#721c24'}; width: 40%;">Student Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid ${status === 'approved' ? '#c3e6cb' : '#f5c6cb'}; color: ${status === 'approved' ? '#155724' : '#721c24'};">${studentName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid ${status === 'approved' ? '#c3e6cb' : '#f5c6cb'}; font-weight: bold; color: ${status === 'approved' ? '#155724' : '#721c24'};">Student ID:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid ${status === 'approved' ? '#c3e6cb' : '#f5c6cb'}; color: ${status === 'approved' ? '#155724' : '#721c24'};">${studentID}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid ${status === 'approved' ? '#c3e6cb' : '#f5c6cb'}; font-weight: bold; color: ${status === 'approved' ? '#155724' : '#721c24'};">Status:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid ${status === 'approved' ? '#c3e6cb' : '#f5c6cb'}; color: ${status === 'approved' ? '#155724' : '#721c24'};">
                  <span style="color: ${status === 'approved' ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </td>
              </tr>
              ${response ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: ${status === 'approved' ? '#155724' : '#721c24'};">Your Response:</td>
                <td style="padding: 8px 0; color: ${status === 'approved' ? '#155724' : '#721c24'};">${response}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/teacher-approval" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              📝 View All Requests
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; margin: 0; font-size: 12px;">
              This is an automated notification from the Smart Exit Monitoring System.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  adminExitRequestNotification: (adminName, studentName, studentID, course, yearLevel, reason, date, time) => ({
    subject: `🚨 New Exit Request from ${studentName} (${studentID}) - Admin Review Required`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e74c3c; margin: 0; font-size: 24px;">🚨 Admin Exit Request Notification</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">Smart Exit Monitoring System</p>
          </div>
          
          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">Hello ${adminName},</h2>
            <p style="color: #34495e; margin: 0; line-height: 1.6;">
              A new exit request has been submitted and requires administrative review and approval.
            </p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 16px;">📋 Request Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404; width: 40%;">Student Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404;">${studentName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404;">Student ID:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404;">${studentID}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404;">Course/Year:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404;">${course} ${yearLevel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404;">Reason for Exit:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404;">${reason}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404;">Date:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #856404;">Time:</td>
                <td style="padding: 8px 0; color: #856404;">${time}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #0c5460; margin: 0 0 15px 0; font-size: 16px;">⚡ Administrative Action Required</h3>
            <p style="color: #0c5460; margin: 0; line-height: 1.6;">
              Please review this exit request and approve or decline it through the Admin Approval Page.
            </p>
            <p style="color: #0c5460; margin: 10px 0 0 0; line-height: 1.6;">
              <strong>Note:</strong> This request has also been sent to relevant department teachers for their review.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/approval" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              📝 Review Request
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; margin: 0; font-size: 12px;">
              This is an automated notification from the Smart Exit Monitoring System.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Admin password change notification email
  adminPasswordChangeNotification: (adminName, adminEmail, changeTime) => ({
    subject: `🔐 Admin Password Changed - Smart Exit Monitoring System`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #27ae60; margin: 0; font-size: 24px;">🔐 Password Successfully Changed</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">Smart Exit Monitoring System</p>
          </div>
          
          <div style="background-color: #d5f4e6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #27ae60; margin: 0 0 15px 0; font-size: 18px;">Hello ${adminName},</h2>
            <p style="color: #2c3e50; margin: 0; line-height: 1.6;">
              This is to confirm that your administrator password has been successfully changed in the Smart Exit Monitoring System.
            </p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 16px;">📋 Password Change Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404; width: 40%;">Admin Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404;">${adminName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; font-weight: bold; color: #856404;">Email Address:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ffeaa7; color: #856404;">${adminEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #856404;">Change Time:</td>
                <td style="padding: 8px 0; color: #856404;">${changeTime}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f3e5f5; border: 1px solid #ce93d8; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #7b1fa2; margin: 0 0 15px 0; font-size: 16px;">🔒 Security Information</h3>
            <p style="color: #2c3e50; margin: 0; line-height: 1.6;">
              <strong>Important:</strong> If you did not make this password change, please contact the system administrator immediately 
              as this could indicate unauthorized access to your account.
            </p>
          </div>
          
          <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 16px;">✅ Next Steps</h3>
            <ul style="color: #2c3e50; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Your new password is now active and ready to use</li>
              <li>You can log in to the system with your new password</li>
              <li>Keep your password secure and do not share it with others</li>
              <li>Consider using a strong, unique password</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
              If you have any questions or concerns about this password change, please contact the system administrator.
            </p>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 12px;">
              This is an automated notification from the Smart Exit Monitoring System.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Student password reset email
  teacherPasswordReset: (teacherName, teacherID, resetCode, email) => ({
    subject: `🔐 Teacher Password Reset - Smart Exit Monitoring System`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e74c3c; margin: 0; font-size: 24px;">🔐 Password Reset Request</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">Smart Exit Monitoring System</p>
          </div>
          
          <div style="background-color: #fdf2f2; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #e74c3c; margin: 0 0 15px 0; font-size: 18px;">Hello ${teacherName},</h2>
            <p style="color: #2c3e50; margin: 0; line-height: 1.6;">
              A password reset request has been made for your teacher account. If you did not request this, please ignore this email.
            </p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 16px;">🔑 Your Reset Code</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin: 15px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #2c3e50; font-family: monospace; letter-spacing: 2px;">${resetCode}</span>
            </div>
            <p style="color: #856404; margin: 0; font-size: 14px;">
              Use this code to reset your password. This code will expire in 15 minutes.
            </p>
          </div>
          
          <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 16px;">📋 Teacher Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #bbdefb; font-weight: bold; color: #1976d2; width: 40%;">Teacher Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #bbdefb; color: #1976d2;">${teacherName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #bbdefb; font-weight: bold; color: #1976d2;">Teacher ID:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #bbdefb; color: #1976d2;">${teacherID}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #1976d2;">Email:</td>
                <td style="padding: 8px 0; color: #1976d2;">${email}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f3e5f5; border: 1px solid #ce93d8; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #7b1fa2; margin: 0 0 15px 0; font-size: 16px;">🔒 Security Information</h3>
            <p style="color: #2c3e50; margin: 0; line-height: 1.6;">
              <strong>Important:</strong> This reset code is valid for 15 minutes only. After that, you'll need to request a new one.
            </p>
            <p style="color: #2c3e50; margin: 10px 0 0 0; line-height: 1.6;">
              If you did not request this password reset, please contact the system administrator immediately.
            </p>
          </div>
          
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #0c5460; margin: 0 0 15px 0; font-size: 16px;">📱 How to Reset Your Password</h3>
            <ol style="color: #2c3e50; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Go to the Smart Exit Monitoring System login page</li>
              <li>Click on "Forgot Password?" or "Teacher Password Reset"</li>
              <li>Enter your teacher ID and the reset code above</li>
              <li>Create a new password (at least 6 characters)</li>
              <li>Confirm your new password</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
              If you have any questions or need assistance, please contact the system administrator.
            </p>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 12px;">
              This is an automated message from the Smart Exit Monitoring System.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  studentPasswordReset: (studentName, studentID, resetCode, email) => ({
    subject: `🔐 Student Password Reset - Smart Exit Monitoring System`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e74c3c; margin: 0; font-size: 24px;">🔐 Password Reset Request</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">Smart Exit Monitoring System</p>
          </div>
          
          <div style="background-color: #fdf2f2; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #e74c3c; margin: 0 0 15px 0; font-size: 18px;">Hello ${studentName},</h2>
            <p style="color: #2c3e50; margin: 0; line-height: 1.6;">
              A password reset request has been made for your student account. If you did not request this, please ignore this email.
            </p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 16px;">🔑 Your Reset Code</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin: 15px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #2c3e50; font-family: monospace; letter-spacing: 2px;">${resetCode}</span>
            </div>
            <p style="color: #856404; margin: 0; font-size: 14px;">
              Use this code to reset your password. This code will expire in 15 minutes.
            </p>
          </div>
          
          <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 16px;">📋 Student Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #bbdefb; font-weight: bold; color: #1976d2; width: 40%;">Student Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #bbdefb; color: #1976d2;">${studentName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #bbdefb; font-weight: bold; color: #1976d2;">Student ID:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #bbdefb; color: #1976d2;">${studentID}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #1976d2;">Email:</td>
                <td style="padding: 8px 0; color: #1976d2;">${email}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f3e5f5; border: 1px solid #ce93d8; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #7b1fa2; margin: 0 0 15px 0; font-size: 16px;">🔒 Security Information</h3>
            <p style="color: #2c3e50; margin: 0; line-height: 1.6;">
              <strong>Important:</strong> This reset code is valid for 15 minutes only. After that, you'll need to request a new one.
            </p>
            <p style="color: #2c3e50; margin: 10px 0 0 0; line-height: 1.6;">
              If you did not request this password reset, please contact your teacher or the system administrator immediately.
            </p>
          </div>
          
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #0c5460; margin: 0 0 15px 0; font-size: 16px;">📱 How to Reset Your Password</h3>
            <ol style="color: #2c3e50; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Go to the Smart Exit Monitoring System login page</li>
              <li>Click on "Forgot Password?" or "Student Password Reset"</li>
              <li>Enter your student ID and the reset code above</li>
              <li>Create a new password (at least 6 characters)</li>
              <li>Confirm your new password</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
              If you have any questions or need assistance, please contact your teacher or the system administrator.
            </p>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 12px;">
              This is an automated message from the Smart Exit Monitoring System.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `
  })
};

// Function to send email
const sendEmail = async (to, template, data) => {
  try {
    const emailContent = template(...data);
    
    const mailOptions = {
      from: emailConfig.auth.user,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Function to send student registration welcome email
const sendStudentRegistrationEmail = async (studentData) => {
  try {
    console.log('📧 Sending student registration welcome email...');
    console.log('   Student:', studentData.firstName, studentData.lastName);
    console.log('   Email:', studentData.email);
    
    if (!studentData.email) {
      console.log('❌ No email address provided for student');
      return false;
    }
    
    const success = await sendEmail(
      studentData.email,
      emailTemplates.studentRegistrationWelcome,
      [
        `${studentData.firstName} ${studentData.lastName}`,
        studentData.studentID,
        studentData.username,
        studentData.password, // This should be the plain text password before hashing
        studentData.email
      ]
    );
    
    if (success) {
      console.log('✅ Student registration email sent successfully');
    } else {
      console.log('❌ Failed to send student registration email');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error sending student registration email:', error);
    return false;
  }
};

// Function to send teacher registration welcome email
const sendTeacherRegistrationEmail = async (teacherData) => {
  try {
    console.log('📧 Sending teacher registration welcome email...');
    console.log('   Teacher:', teacherData.firstName, teacherData.lastName);
    console.log('   Email:', teacherData.email);
    
    if (!teacherData.email) {
      console.log('❌ No email address provided for teacher');
      return false;
    }
    
    const success = await sendEmail(
      teacherData.email,
      emailTemplates.teacherRegistrationWelcome,
      [
        `${teacherData.firstName} ${teacherData.lastName}`,
        teacherData.teacherID,
        teacherData.username,
        teacherData.password,
        teacherData.email
      ]
    );
    
    if (success) {
      console.log('✅ Teacher registration email sent successfully');
    } else {
      console.log('❌ Failed to send teacher registration email');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error sending teacher registration email:', error);
    return false;
  }
};

// Function to send teacher account update notification
const sendTeacherUpdateEmail = async (teacherData, updatedFields) => {
  try {
    console.log('📧 Sending teacher account update notification...');
    console.log('   Teacher:', teacherData.firstName, teacherData.lastName);
    console.log('   Email:', teacherData.email);
    console.log('   Updated fields:', Object.keys(updatedFields));
    
    if (!teacherData.email) {
      console.log('❌ No email address provided for teacher');
      return false;
    }
    
    const success = await sendEmail(
      teacherData.email,
      emailTemplates.teacherAccountUpdate,
      [
        `${teacherData.firstName} ${teacherData.lastName}`,
        teacherData.teacherID,
        updatedFields,
        teacherData.email
      ]
    );
    
    if (success) {
      console.log('✅ Teacher update email sent successfully');
    } else {
      console.log('❌ Failed to send teacher update email');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error sending teacher update email:', error);
    return false;
  }
};

// Function to send admin password reset email
const sendAdminPasswordResetEmail = async (adminData, resetCode) => {
  try {
    console.log('📧 Sending admin password reset email...');
    console.log('   Admin:', adminData.firstName, adminData.lastName);
    console.log('   Email:', adminData.email);
    console.log('   Reset Code:', resetCode);
    
    if (!adminData.email) {
      console.log('❌ No email address provided for admin');
      return false;
    }
    
    const success = await sendEmail(
      adminData.email,
      emailTemplates.adminPasswordReset,
      [
        `${adminData.firstName} ${adminData.lastName}`,
        resetCode,
        adminData.email
      ]
    );
    
    if (success) {
      console.log('✅ Admin password reset email sent successfully');
    } else {
      console.log('❌ Failed to send admin password reset email');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error sending admin password reset email:', error);
    return false;
  }
};

// Function to send admin password change notification
const sendAdminPasswordChangeNotification = async (adminName, adminEmail) => {
  try {
    console.log('📧 Sending admin password change notification...');
    console.log('   Admin:', adminName);
    console.log('   Email:', adminEmail);
    
    if (!adminEmail) {
      console.log('❌ No email address provided for admin notification');
      return false;
    }
    
    const changeTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
    
    const success = await sendEmail(
      adminEmail,
      emailTemplates.adminPasswordChangeNotification,
      [
        adminName,
        adminEmail,
        changeTime
      ]
    );
    
    if (success) {
      console.log('✅ Admin password change notification sent successfully');
    } else {
      console.log('❌ Failed to send admin password change notification');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error sending admin password change notification:', error);
    return false;
  }
};

// Function to send student password reset email
const sendStudentPasswordResetEmail = async (studentData, resetCode) => {
  try {
    console.log('📧 Sending student password reset email...');
    console.log('   Student:', studentData.firstName, studentData.lastName);
    console.log('   Student ID:', studentData.studentID);
    console.log('   Email:', studentData.email);
    console.log('   Reset Code:', resetCode);
    
    if (!studentData.email) {
      console.log('❌ No email address provided for student');
      return false;
    }
    
    const success = await sendEmail(
      studentData.email,
      emailTemplates.studentPasswordReset,
      [
        `${studentData.firstName} ${studentData.lastName}`,
        studentData.studentID,
        resetCode,
        studentData.email
      ]
    );
    
    if (success) {
      console.log('✅ Student password reset email sent successfully');
    } else {
      console.log('❌ Failed to send student password reset email');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error sending student password reset email:', error);
    return false;
  }
};

// Function to send teacher password reset email
const sendTeacherPasswordResetEmail = async (teacherData, resetCode) => {
  try {
    console.log('📧 Sending teacher password reset email...');
    console.log('   Teacher:', teacherData.firstName, teacherData.lastName);
    console.log('   Teacher ID:', teacherData.teacherID);
    console.log('   Email:', teacherData.email);
    console.log('   Reset Code:', resetCode);
    
    if (!teacherData.email) {
      console.log('❌ No email address provided for teacher');
      return false;
    }
    
    const success = await sendEmail(
      teacherData.email,
      emailTemplates.teacherPasswordReset,
      [
        `${teacherData.firstName} ${teacherData.lastName}`,
        teacherData.teacherID,
        resetCode,
        teacherData.email
      ]
    );
    
    if (success) {
      console.log('✅ Teacher password reset email sent successfully');
    } else {
      console.log('❌ Failed to send teacher password reset email');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error sending teacher password reset email:', error);
    return false;
  }
};

// Function to send student account update notification
const sendStudentUpdateEmail = async (studentData, updatedFields) => {
  try {
    console.log('📧 Sending student account update notification...');
    console.log('   Student:', studentData.firstName, studentData.lastName);
    console.log('   Email:', studentData.email);
    console.log('   Updated fields:', Object.keys(updatedFields));
    
    if (!studentData.email) {
      console.log('❌ No email address provided for student');
      return false;
    }
    
    const success = await sendEmail(
      studentData.email,
      emailTemplates.studentAccountUpdate,
      [
        `${studentData.firstName} ${studentData.lastName}`,
        studentData.studentID,
        updatedFields,
        studentData.email
      ]
    );
    
    if (success) {
      console.log('✅ Student update email sent successfully');
    } else {
      console.log('❌ Failed to send student update email');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error sending student update email:', error);
    return false;
  }
};

// Function to notify teachers about new exit requests
const notifyTeachersAboutExitRequest = async (exitRequest, Teacher) => {
  try {
    console.log('🔍 Starting email notification process...');
    console.log('📋 Exit request details:');
    console.log('   Student:', exitRequest.firstName, exitRequest.lastName);
    console.log('   Student ID:', exitRequest.studentID);
    console.log('   Course:', exitRequest.course);
    console.log('   Year Level:', exitRequest.yearLevel);
    console.log('   Reason:', exitRequest.reasonForExit);
    
    let query = {};
    if (exitRequest.course && ['BSIT', 'BSHM', 'ENTREP', 'EDUC'].includes(exitRequest.course)) {
      // College course - notify teachers assigned to this course
      query = { 
        department: 'College',
        position: exitRequest.course
      };
      console.log('📚 College course detected. Looking for teachers with query:', query);
    } else if (exitRequest.course && ['STEM', 'HUMSS', 'TVL', 'ABM'].includes(exitRequest.course)) {
      // Highschool strand - notify teachers assigned to this strand
      query = { 
        department: 'Highschool',
        position: exitRequest.course
      };
      console.log('🏫 High school strand detected. Looking for teachers with query:', query);
    } else if (exitRequest.yearLevel && ['Grade 11', 'Grade 12'].includes(exitRequest.yearLevel)) {
      // Highschool grade - notify teachers assigned to this grade
      query = { 
        department: 'Highschool',
        position: exitRequest.yearLevel
      };
      console.log('🏫 High school grade detected. Looking for teachers with query:', query);
    } else {
      console.log('❌ No matching course/grade found for email notifications');
      console.log('💡 Supported college courses: BSIT, BSHM, ENTREP, EDUC');
      console.log('💡 Supported highschool strands: STEM, HUMSS, TVL, ABM');
      console.log('💡 Supported grades: Grade 11, Grade 12');
      return;
    }
    
    if (Object.keys(query).length > 0) {
      const teachers = await Teacher.find(query);
      console.log(`👨‍🏫 Found ${teachers.length} matching teachers:`);
      
      if (teachers.length === 0) {
        console.log('❌ No teachers found matching the criteria');
        console.log('💡 Make sure teachers have correct Department and Position settings:');
        console.log('   - For EDUC: Department="College", Position="EDUC"');
        console.log('   - For BSIT: Department="College", Position="BSIT"');
        console.log('   - For BSHM: Department="College", Position="BSHM"');
        console.log('   - For ENTREP: Department="College", Position="ENTREP"');
        console.log('   - For STEM: Department="Highschool", Position="STEM"');
        console.log('   - For HUMSS: Department="Highschool", Position="HUMSS"');
        console.log('   - For TVL: Department="Highschool", Position="TVL"');
        console.log('   - For ABM: Department="Highschool", Position="ABM"');
        console.log('   - For Grade 11: Department="Highschool", Position="Grade 11"');
        
        // Show all teachers for debugging
        const allTeachers = await Teacher.find({});
        console.log(`📊 All teachers in database (${allTeachers.length}):`);
        allTeachers.forEach((teacher, index) => {
          console.log(`   ${index + 1}. ${teacher.firstName} ${teacher.lastName}`);
          console.log(`      Department: "${teacher.department}"`);
          console.log(`      Position: "${teacher.position}"`);
          console.log(`      Email: ${teacher.email || 'NO EMAIL'}`);
        });
        return;
      }
      
      let emailsSent = 0;
      let emailsFailed = 0;
      
      for (const teacher of teachers) {
        console.log(`📧 Processing teacher: ${teacher.firstName} ${teacher.lastName}`);
        console.log(`   Department: ${teacher.department}`);
        console.log(`   Position: ${teacher.position}`);
        console.log(`   Email: ${teacher.email || 'NO EMAIL'}`);
        
        if (teacher.email) {
          console.log(`📤 Sending email to ${teacher.email}...`);
          
          const emailSent = await sendEmail(
            teacher.email,
            emailTemplates.exitRequestNotification,
            [
              teacher.firstName + ' ' + teacher.lastName,
              exitRequest.firstName + ' ' + exitRequest.lastName,
              exitRequest.studentID,
              exitRequest.course || '',
              exitRequest.yearLevel || '',
              exitRequest.reasonForExit,
              exitRequest.date,
              exitRequest.time
            ]
          );
          
          if (emailSent) {
            emailsSent++;
            console.log(`✅ Email sent successfully to ${teacher.email}`);
          } else {
            emailsFailed++;
            console.log(`❌ Failed to send email to ${teacher.email}`);
          }
        } else {
          emailsFailed++;
          console.log(`❌ Teacher ${teacher.firstName} ${teacher.lastName} has no email address`);
        }
      }
      
      console.log(`📊 Email notification summary:`);
      console.log(`   ✅ Emails sent successfully: ${emailsSent}`);
      console.log(`   ❌ Emails failed: ${emailsFailed}`);
      console.log(`   👨‍🏫 Total teachers processed: ${teachers.length}`);
      
      if (emailsSent === 0) {
        console.log('🚨 WARNING: No emails were sent successfully!');
        console.log('💡 Check Gmail configuration in .env file');
        console.log('💡 Ensure teachers have valid email addresses');
      }
    }
  } catch (error) {
    console.error('❌ Error in email notification process:', error);
    console.error('📍 Stack trace:', error.stack);
    
    // Additional debugging info
    console.log('🔍 Debugging info:');
    console.log('   Gmail User:', process.env.GMAIL_USER || 'NOT SET');
    console.log('   Gmail Password:', process.env.GMAIL_APP_PASSWORD ? 'SET' : 'NOT SET');
  }
};

// Function to send confirmation email to teacher after approval/decline
const sendTeacherConfirmationEmail = async (teacherEmail, teacherName, studentName, studentID, status, response) => {
  try {
    await sendEmail(
      teacherEmail,
      emailTemplates.exitRequestUpdate,
      [teacherName, studentName, studentID, status, response]
    );
    console.log(`Sent confirmation email to teacher ${teacherName} about ${status} exit request`);
  } catch (error) {
    console.error('Error sending teacher confirmation email:', error);
  }
};

// Function to notify admins about new exit requests
const notifyAdminAboutExitRequest = async (exitRequest, Admin) => {
  try {
    console.log('🔍 Starting admin email notification process...');
    console.log('📋 Exit request details for admin:');
    console.log('   Student:', exitRequest.firstName, exitRequest.lastName);
    console.log('   Student ID:', exitRequest.studentID);
    console.log('   Course:', exitRequest.course);
    console.log('   Year Level:', exitRequest.yearLevel);
    console.log('   Reason:', exitRequest.reasonForExit);
    
    // Get all admins (admins should receive ALL exit requests)
    const admins = await Admin.find({});
    console.log(`👨‍💼 Found ${admins.length} admins in database`);
    
    if (admins.length === 0) {
      console.log('❌ No admins found in database');
      console.log('💡 Create admin accounts to receive exit request notifications');
      return;
    }
    
    let emailsSent = 0;
    let emailsFailed = 0;
    
    for (const admin of admins) {
      console.log(`📧 Processing admin: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Admin ID: ${admin.adminID}`);
      console.log(`   Email: ${admin.email || 'NO EMAIL'}`);
      
      if (admin.email) {
        console.log(`📤 Sending admin notification email to ${admin.email}...`);
        
        const emailSent = await sendEmail(
          admin.email,
          emailTemplates.adminExitRequestNotification,
          [
            admin.firstName + ' ' + admin.lastName,
            exitRequest.firstName + ' ' + exitRequest.lastName,
            exitRequest.studentID,
            exitRequest.course || '',
            exitRequest.yearLevel || '',
            exitRequest.reasonForExit,
            exitRequest.date,
            exitRequest.time
          ]
        );
        
        if (emailSent) {
          emailsSent++;
          console.log(`✅ Admin notification email sent successfully to ${admin.email}`);
        } else {
          emailsFailed++;
          console.log(`❌ Failed to send admin notification email to ${admin.email}`);
        }
      } else {
        emailsFailed++;
        console.log(`❌ Admin ${admin.firstName} ${admin.lastName} has no email address`);
      }
    }
    
    console.log(`📊 Admin email notification summary:`);
    console.log(`   ✅ Emails sent successfully: ${emailsSent}`);
    console.log(`   ❌ Emails failed: ${emailsFailed}`);
    console.log(`   👨‍💼 Total admins processed: ${admins.length}`);
    
    if (emailsSent === 0) {
      console.log('🚨 WARNING: No admin emails were sent successfully!');
      console.log('💡 Check Gmail configuration in .env file');
      console.log('💡 Ensure admins have valid email addresses');
    }
  } catch (error) {
    console.error('❌ Error in admin email notification process:', error);
    console.error('📍 Stack trace:', error.stack);
  }
};

// Send security notification when request is fully approved
const sendSecurityNotificationEmail = async (studentName, studentID, course, date, time, reason) => {
  try {
    const mailOptions = {
      from: emailConfig.auth.user,
      to: process.env.SECURITY_EMAIL || 'security@school.edu', // Security email address
      subject: `🛡️ SECURITY ALERT: Approved Exit Request - ${studentName} (${studentID})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🛡️ SECURITY ALERT</h1>
            <p style="margin: 10px 0 0 0;">Exit Request Fully Approved</p>
          </div>
          
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h2 style="color: #2c3e50; margin-top: 0;">Student Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Student Name:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${studentName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Student ID:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${studentID}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Course:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${course}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Exit Date:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Exit Time:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Reason:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${reason}</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px;">
              <h3 style="color: #155724; margin-top: 0;">✅ APPROVAL STATUS</h3>
              <p style="color: #155724; margin-bottom: 0;">
                <strong>Both teacher and admin have approved this exit request.</strong><br>
                The student is authorized to leave the campus on the specified date and time.
              </p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
              <h3 style="color: #856404; margin-top: 0;">🛡️ SECURITY ACTION REQUIRED</h3>
              <ul style="color: #856404; margin-bottom: 0;">
                <li>Verify student ID when they attempt to exit</li>
                <li>Check that the exit time matches the approved time</li>
                <li>Record the actual exit time in your security log</li>
                <li>Ensure the student has proper identification</li>
              </ul>
            </div>
          </div>
          
          <div style="background-color: #ecf0f1; padding: 15px; text-align: center; color: #7f8c8d;">
            <p style="margin: 0; font-size: 12px;">
              This is an automated notification from the Smart Exit Monitoring System.<br>
              Please verify all information before allowing the student to exit.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('🛡️ Security notification email sent successfully');
  } catch (error) {
    console.error('Error sending security notification email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  notifyTeachersAboutExitRequest,
  notifyAdminAboutExitRequest,
  sendTeacherConfirmationEmail,
  sendStudentRegistrationEmail,
  sendStudentUpdateEmail,
  sendTeacherRegistrationEmail,
  sendTeacherUpdateEmail,
  sendAdminPasswordResetEmail,
  sendAdminPasswordChangeNotification,
  sendStudentPasswordResetEmail,
  sendTeacherPasswordResetEmail,
  emailTemplates,
  departmentEmails,
  sendSecurityNotificationEmail
};
