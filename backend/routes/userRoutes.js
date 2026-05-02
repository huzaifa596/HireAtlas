const express=require('express')
const router=express.Router();
const {uploadCv,upload,getProfile,updatePersonalInfo,saveEducation,deleteEducation,saveExperience,deleteExperience,saveSkill,deleteSkill}=require('../controllers/userController')
const verifyToken = require('../middleware/authMiddleware');

console.log("getProfile:", getProfile);
router.get('/', verifyToken, getProfile);
router.patch('/personal',    verifyToken, updatePersonalInfo);  
router.patch('/education',  verifyToken, saveEducation);  
router.delete('/education/:eduId',   verifyToken, deleteEducation);  
router.patch('/experience',        verifyToken, saveExperience);   
router.delete('/experience/:expId',  verifyToken, deleteExperience);  
router.patch('/skills',                  verifyToken, saveSkill);          
router.delete('/skills/:userSkillId',    verifyToken, deleteSkill); 
router.post('/cv', verifyToken, upload.single('cv'), uploadCv); 
module.exports = router; 