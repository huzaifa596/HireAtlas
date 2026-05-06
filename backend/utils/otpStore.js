// backend/utils/otpStore.js

const otpMap = new Map();
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const saveOTP = (email, otp) => {
  otpMap.set(email, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });
};

const verifyOTP = (email, otp) => {
  const record = otpMap.get(email);
  if (!record) return { valid: false, message: "No OTP found for this email" };
  if (Date.now() > record.expiresAt) {
    otpMap.delete(email);
    return { valid: false, message: "OTP has expired" };
  }
  if (record.otp !== otp) return { valid: false, message: "Invalid OTP" };
  otpMap.delete(email); // one-time use
  return { valid: true };
};

module.exports = { generateOTP, saveOTP, verifyOTP };