// Backend/services/emailService.js

const nodemailer = require('nodemailer');

// 1. Create a "transporter" object using the SMTP configuration
// This object is what actually connects to Gmail and sends the mail.
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' as a known service
  auth: {
    user: process.env.EMAIL_USER, // Your email from the .env file
    pass: process.env.EMAIL_PASS, // Your App Password from the .env file
  },
});

/**
 * Sends an email notification when a new task is assigned.
 * @param {string} userEmail The email address of the user the task is assigned to.
 * @param {object} task The task object containing details like text and deadline.
 */
const sendNewTaskEmail = async (userEmail, task) => {
  try {
    // Format the deadline for readability in the email
    const deadline = new Date(task.deadline).toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    });

    const mailOptions = {
      from: `"Project Taskboard" <${process.env.EMAIL_USER}>`, // Sender address (shows your name and email)
      to: userEmail, // Receiver's email address
      subject: 'New Task Assigned to You!', // Subject line
      // Plain text body (for email clients that don't support HTML)
      text: `Hello,\n\nA new task has been assigned to you:\n\nTask: ${task.text}\nDeadline: ${deadline}\n\nPlease log in to view your taskboard.\n\nThank you!`,
      // HTML body (for modern email clients)
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Task Assigned!</h2>
          <p>Hello,</p>
          <p>A new task has been assigned to you by an administrator.</p>
          <hr>
          <h3>Task Details:</h3>
          <p><strong>Task:</strong> ${task.text}</p>
          <p><strong>Deadline:</strong> ${deadline}</p>
          <hr>
          <p>Please log in to your dashboard to view more details and update the status.</p>
          <p>Thank you!</p>
        </div>
      `,
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
    console.log(`✅ New task notification sent successfully to ${userEmail}`);

  } catch (error) {
    console.error(`❌ Error sending new task email to ${userEmail}:`, error);
    // In a real app, you might add more robust error handling here,
    // like adding the failed email to a retry queue.
  }
};

module.exports = {
  sendNewTaskEmail,
};