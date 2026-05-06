const express    = require('express');
const router     = express.Router();
const { signup, login,forgotPassword, verifyForgotPasswordOTP, resetPassword } = require('../controllers/AuthController');

router.post('/signup', signup);
router.post('/login',  login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-otp", verifyForgotPasswordOTP);
router.post("/reset-password", resetPassword);

module.exports = router;