require('dotenv').config();
const {sql,PoolPromise}=require('../config/db');

const getProfile=async(req,res)=>{
 try{
    const pool=await PoolPromise;
    const result=await pool.request()
    .input('UserId',sql.BigInt,req.user.userID)
    .execute('sp_GetUserProfile');
    return res.status(200).json({status:'SUCCESS',profile:result.recordset[0]});
 }
 catch(err){
    console.error('Get profile error:',err);
    return res.status(500).json({status:'ERROR',message:'Could not fetch profile'});
 }
}