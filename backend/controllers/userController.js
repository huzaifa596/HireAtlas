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
        personalInfo: result.recordsets[0][0],
        education:    result.recordsets[1],
        experience:   result.recordsets[2],
        skills:       result.recordsets[3]
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ status: 'ERROR', message: 'Could not fetch profile' });
  }
};



const updatePersonalInfo = async (req, res) => {
  try {
    const { name, email, phone, age } = req.body;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.BigInt,      req.user.userID)
      .input('name',   sql.VarChar(100), name)
      .input('email',  sql.VarChar(150), email)
      .input('phone',  sql.VarChar(20),  phone ?? null)
      .input('age',    sql.Int,          age   ?? null)
      .execute('sp_UpdatePersonalInfo');

    const spResult = result.recordset[0];

    const statusMap = {
      'USER_NOT_FOUND':      { code: 404, message: 'User not found' },
      'INVALID_NAME':        { code: 400, message: 'Name is required' },
      'INVALID_EMAIL':       { code: 400, message: 'Email is required' },
      'EMAIL_ALREADY_EXISTS':{ code: 409, message: 'Email already in use' },
    };

    if (statusMap[spResult.Status]) {
      const { code, message } = statusMap[spResult.Status];
      return res.status(code).json({ status: 'ERROR', message });
    }

    // SUCCESS — return updated user
    return res.status(200).json({
      status: 'SUCCESS',
      personalInfo: spResult
    });

  } catch (err) {
    console.error('Update personal info error:', err);
    return res.status(500).json({ status: 'ERROR', message: 'Could not update profile' });
  }
};

const saveEducation = async (req, res) => {
  try {
    const { eduId, instituteName, level, degreeName, grade, startDate, endDate } = req.body;

    const pool = await poolPromise;

    let spResult;

    if (eduId) {
      // ── UPDATE existing entry ──
      const result = await pool.request()
        .input('eduId',         sql.BigInt,      eduId)
        .input('userId',        sql.BigInt,      req.user.userID)
        .input('instituteName', sql.VarChar(200), instituteName ?? null)
        .input('level',         sql.VarChar(100), level         ?? null)
        .input('degreeName',    sql.VarChar(150), degreeName    ?? null)
        .input('grade',         sql.VarChar(50),  grade         ?? null)
        .input('startDate',     sql.Date,         startDate     ?? null)
        .input('endDate',       sql.Date,         endDate       ?? null)
        .execute('sp_UpdateEducation');

      spResult = result.recordset[0];

    } else {
      // ── ADD new entry ──
      const result = await pool.request()
        .input('userId',        sql.BigInt,      req.user.userID)
        .input('instituteName', sql.VarChar(200), instituteName)
        .input('level',         sql.VarChar(100), level)
        .input('degreeName',    sql.VarChar(150), degreeName)
        .input('grade',         sql.VarChar(50),  grade      ?? null)
        .input('startDate',     sql.Date,         startDate)
        .input('endDate',       sql.Date,         endDate    ?? null)
        .execute('sp_AddEducation');

      spResult = result.recordset[0];
    }

    const statusMap = {
      'USER_NOT_FOUND':          { code: 404, message: 'User not found' },
      'EDUCATION_NOT_FOUND':     { code: 404, message: 'Education entry not found' },
      'MISSING_REQUIRED_FIELDS': { code: 400, message: 'instituteName, level, degreeName and startDate are required' },
    };

    if (statusMap[spResult.Status]) {
      const { code, message } = statusMap[spResult.Status];
      return res.status(code).json({ status: 'ERROR', message });
    }

    return res.status(200).json({
      status: 'SUCCESS',
      education: spResult
    });

  } catch (err) {
    console.error('Save education error:', err);
    return res.status(500).json({ status: 'ERROR', message: 'Could not save education' });
  }
};


const deleteEducation = async (req, res) => {
  try {
    const eduId = parseInt(req.params.eduId);

    if (!eduId || isNaN(eduId)) {
      return res.status(400).json({ status: 'ERROR', message: 'Invalid education ID' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('eduId',  sql.BigInt, eduId)
      .input('userId', sql.BigInt, req.user.userID)
      .execute('sp_DeleteEducation');

    const spResult = result.recordset[0];

    if (spResult.Status === 'EDUCATION_NOT_FOUND') {
      return res.status(404).json({ status: 'ERROR', message: 'Education entry not found' });
    }

    return res.status(200).json({ status: 'SUCCESS', message: 'Education entry deleted' });

  } catch (err) {
    console.error('Delete education error:', err);
    return res.status(500).json({ status: 'ERROR', message: 'Could not delete education' });
  }
};


const saveExperience = async (req, res) => {
  try {
    const { expId, companyName, jobTitle, description, startDate, endDate } = req.body;

    const pool = await poolPromise;

    let spResult;

    if (expId) {
      // ── UPDATE existing entry ──
      const result = await pool.request()
        .input('expId',       sql.BigInt,       expId)
        .input('userId',      sql.BigInt,       req.user.userID)
        .input('companyName', sql.VarChar(200),  companyName  ?? null)
        .input('jobTitle',    sql.VarChar(150),  jobTitle     ?? null)
        .input('description', sql.VarChar(1000), description  ?? null)
        .input('startDate',   sql.Date,          startDate    ?? null)
        .input('endDate',     sql.Date,          endDate      ?? null)
        .execute('sp_UpdateExperience');

      spResult = result.recordset[0];

    } else {
      // ── ADD new entry ──
      const result = await pool.request()
        .input('userId',      sql.BigInt,       req.user.userID)
        .input('companyName', sql.VarChar(200),  companyName)
        .input('jobTitle',    sql.VarChar(150),  jobTitle)
        .input('description', sql.VarChar(1000), description  ?? null)
        .input('startDate',   sql.Date,          startDate)
        .input('endDate',     sql.Date,          endDate      ?? null)
        .execute('sp_AddExperience');

      spResult = result.recordset[0];
    }

    const statusMap = {
      'USER_NOT_FOUND':          { code: 404, message: 'User not found' },
      'EXPERIENCE_NOT_FOUND':    { code: 404, message: 'Experience entry not found' },
      'MISSING_REQUIRED_FIELDS': { code: 400, message: 'companyName, jobTitle and startDate are required' },
    };

    if (statusMap[spResult.Status]) {
      const { code, message } = statusMap[spResult.Status];
      return res.status(code).json({ status: 'ERROR', message });
    }

    return res.status(200).json({
      status: 'SUCCESS',
      experience: spResult
    });

  } catch (err) {
    console.error('Save experience error:', err);
    return res.status(500).json({ status: 'ERROR', message: 'Could not save experience' });
  }
};

module.exports = { getProfile, updatePersonalInfo,saveEducation ,deleteEducation ,saveExperience};