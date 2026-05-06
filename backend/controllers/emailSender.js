const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,       // your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not your login password)
  },
});

// Email 1 — to applicant
const sendApplicationConfirmation = async ({
  to,
  applicantName,
  jobTitle,
  companyName,
}) => {
  await transporter.sendMail({
    from: `"HireAtlas" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Application Submitted — ${jobTitle}`,
    text: `Hi ${applicantName},\n\nYou have successfully applied for ${jobTitle} at ${companyName}.\n\nGood luck!\n\nHireAtlas`,
  });
};

// Email 2 — to employer
const sendNewApplicationNotification = async ({
  to,
  employerName,
  applicantName,
  applicantEmail,
  jobTitle,
}) => {
  await transporter.sendMail({
    from: `"HireAtlas" <${process.env.GMAIL_USER}>`,
    to,
    subject: `New Application — ${jobTitle}`,
    text: `Hi ${employerName},\n\n${applicantName} (${applicantEmail}) has applied for ${jobTitle}.\n\nLogin to HireAtlas to review their application.\n\nHireAtlas`,
  });
};

// Add these two functions to your existing emailSender.js

// Email 3 — forgot password OTP
const sendForgotPasswordOTP = async ({ to, otp }) => {
  await transporter.sendMail({
    from: `"HireAtlas" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Reset Your Password — HireAtlas`,
    text: `Your password reset OTP is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.\n\nHireAtlas`,
  });
};

// Email 4 — profile verification OTP
const sendProfileVerificationOTP = async ({ to, otp }) => {
  await transporter.sendMail({
    from: `"HireAtlas" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Verify Your Profile — HireAtlas`,
    text: `Your profile verification OTP is: ${otp}\n\nThis code expires in 10 minutes.\n\nHireAtlas`,
  });
};

// Add these to module.exports too:
module.exports = {
  sendApplicationConfirmation,
  sendNewApplicationNotification,
  sendForgotPasswordOTP,
  sendProfileVerificationOTP,
};