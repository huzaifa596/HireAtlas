const express=require('express')
const router=express.Router();
const {getProfile,updatePersonalInfo}=require('../controllers/userController')
const verifyToken = require('../middleware/authMiddleware');

console.log("getProfile:", getProfile);
router.get('/', verifyToken, getProfile);
router.patch('/personal',    verifyToken, updatePersonalInfo);  
module.exports = router; 