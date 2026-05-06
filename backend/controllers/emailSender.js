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

module.exports = {
  sendApplicationConfirmation,
  sendNewApplicationNotification,
};