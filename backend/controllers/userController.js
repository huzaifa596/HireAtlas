require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

const getProfile = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserId', sql.BigInt, req.user.userID)
      .execute('GetUserProfile');

      console.log("Querying with UserID:", req.user.userID);

    return res.status(200).json({
      status: 'SUCCESS',
      profile: {
        personalInfo:  result.recordsets[0][0], // single object
        education:     result.recordsets[1],     // array
        experience:    result.recordsets[2],     // array
        skills:        result.recordsets[3]      // array
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ status: 'ERROR', message: 'Could not fetch profile' });
  }
};

module.exports = { getProfile };