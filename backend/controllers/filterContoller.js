require('dotenv').config();
const { pool } = require('../config/db');

const csv = (value) => value ? String(value).split(',').map((item) => item.trim()).filter(Boolean) : null;
const optionalNumber = (value) => value === undefined || value === '' ? null : Number(value);

// Parameterized PostgreSQL filtering. Keeping this query in one place makes
// filters predictable, prevents SQL injection, and uses the schema indexes.
const filterJobs = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const values = [
      csv(req.query.empType), csv(req.query.experienceLevel),
      ['0', '1', 0, 1, true, false].includes(req.query.isRemote) && req.query.isRemote !== 'any' ? ['1', 1, true].includes(req.query.isRemote) : null,
      csv(req.query.jobCategory), optionalNumber(req.query.minSalary), optionalNumber(req.query.maxSalary),
      req.query.postedDate || null, req.query.location?.trim() ? `%${req.query.location.trim()}%` : null,
      req.query.companyName?.trim() ? `%${req.query.companyName.trim()}%` : null,
    ];
    const where = `isactive = TRUE
      AND ($1::text[] IS NULL OR emptype = ANY($1))
      AND ($2::text[] IS NULL OR experiencelevel = ANY($2))
      AND ($3::boolean IS NULL OR isremote = $3)
      AND ($4::text[] IS NULL OR jobcategory = ANY($4))
      AND ($5::numeric IS NULL OR maxsalary >= $5)
      AND ($6::numeric IS NULL OR minsalary <= $6)
      AND ($7::date IS NULL OR posteddate = $7)
      AND ($8::text IS NULL OR location ILIKE $8)
      AND ($9::text IS NULL OR companyname ILIKE $9)`;
    const [data, count] = await Promise.all([
      pool.query(`SELECT postid AS "postId",jobtitle AS "jobTitle",companyname AS "companyName",location,emptype AS "empType",experiencelevel AS "experienceLevel",minsalary AS "minSalary",maxsalary AS "maxSalary",posteddate AS "postedDate",isremote AS "isRemote",jobcategory AS "jobCategory" FROM post WHERE ${where} ORDER BY posteddate DESC, postid DESC LIMIT $10 OFFSET $11`, [...values, limit, (page - 1) * limit]),
      pool.query(`SELECT COUNT(*)::int AS total FROM post WHERE ${where}`, values),
    ]);
    const total = count.rows[0].total;
    return res.json({ jobs: data.rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('PostgreSQL filter error:', err);
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

module.exports = { filterJobs };
