const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// Email 1 — to applicant
const sendApplicationConfirmation = async ({
  to,
  applicantName,
  jobTitle,
  companyName,
}) => {
  await resend.emails.send({
    from: "HireAtlas <onboarding@resend.dev>",
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
  await resend.emails.send({
    from: "HireAtlas <onboarding@resend.dev>",
    to,
    subject: `New Application — ${jobTitle}`,
    text: `Hi ${employerName},\n\n${applicantName} (${applicantEmail}) has applied for ${jobTitle}.\n\nLogin to HireAtlas to review their application.\n\nHireAtlas`,
  });
};

module.exports = {
  sendApplicationConfirmation,
  sendNewApplicationNotification,
};
