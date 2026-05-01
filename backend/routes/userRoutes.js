const express=require('express')
const router=express.Router();
const {getProfile,updatePersonalInfo,saveEducation,deleteEducation,saveExperience}=require('../controllers/userController')
const verifyToken = require('../middleware/authMiddleware');

console.log("getProfile:", getProfile);
router.get('/', verifyToken, getProfile);
router.patch('/personal',    verifyToken, updatePersonalInfo);  
router.post('/education',  verifyToken, saveEducation);  
router.delete('/education/:eduId',   verifyToken, deleteEducation);  
router.patch('/experience',        verifyToken, saveExperience);           
module.exports = router; 