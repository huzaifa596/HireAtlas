const express=require('express')
const router=express.Router();
const {getProfile}=require('../controllers/userController')
const verifyToken = require('../middleware/authMiddleware');

console.log("getProfile:", getProfile);
router.get('/', verifyToken, getProfile);

module.exports = router; 