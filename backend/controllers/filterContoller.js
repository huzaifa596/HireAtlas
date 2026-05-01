require("dotenv").config();
const { sql, poolPromise } = require("../config/db");

// GET /api/jobs?empType=Full-Time,Part-Time&experienceLevel=Senior&minSalary=100000&sortBy=newest&page=1
const filterJobs = async (req, res) => {
  try {
    let {
      empType,
      experienceLevel,
      isRemote,
      jobCategory,
      minSalary,
      maxSalary,
      postedAfter,
      location,
      companyName,
      sortBy = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    page = Math.max(1, Number(page));
    limit = Math.min(100, Math.max(1, Number(limit)));
    const offset = (page - 1) * limit;

    //Whitelist sort (prevents SQL injection)
    const sortMap = {
      newest: "postedDate DESC",
      oldest: "postedDate ASC",
      salary_high: "maxSalary DESC",
      salary_low: "minSalary ASC",
    };
    const orderBy = sortMap[sortBy] || sortMap.newest;

    // Build request with ALL possible parameters
    const pool = await poolPromise;
    const request = await pool.request();

    request.input("empType", sql.NVarChar(sql.MAX), empType || null);
    request.input(
      "experienceLevel",
      sql.NVarChar(sql.MAX),
      experienceLevel || null,
    );
    request.input(
      "isRemote",
      sql.Bit,
      isRemote !== undefined && isRemote !== "any" ? Number(isRemote) : null,
    );
    request.input("jobCategory", sql.NVarChar(sql.MAX), jobCategory || null);
    request.input(
      "minSalary",
      sql.Decimal(18, 2),
      minSalary ? Number(minSalary) : null,
    );
    request.input(
      "maxSalary",
      sql.Decimal(18, 2),
      maxSalary ? Number(maxSalary) : null,
    );
    request.input("postedAfter", sql.Date, postedAfter || null);
    request.input(
      "location",
      sql.NVarChar(150),
      location ? `%${location.trim()}%` : null,
    );
    request.input(
      "companyName",
      sql.NVarChar(200),
      companyName ? `%${companyName.trim()}%` : null,
    );
    request.input("offsetRows", sql.Int, offset);
    request.input("fetchRows", sql.Int, limit);

    // ── WHERE clause: NULL means "ignore this filter" ──
    const whereClause = `
      isActive = 1
      AND (@empType IS NULL OR empType IN (SELECT value FROM STRING_SPLIT(@empType, ',')))
      AND (@experienceLevel IS NULL OR experienceLevel IN (SELECT value FROM STRING_SPLIT(@experienceLevel, ',')))
      AND (@isRemote IS NULL OR isRemote = @isRemote)
      AND (@jobCategory IS NULL OR jobCategory IN (SELECT value FROM STRING_SPLIT(@jobCategory, ',')))
      AND (@minSalary IS NULL OR maxSalary >= @minSalary)
      AND (@maxSalary IS NULL OR minSalary <= @maxSalary)
      AND (@postedAfter IS NULL OR postedDate >= @postedAfter)
      AND (@location IS NULL OR location LIKE @location)
      AND (@companyName IS NULL OR companyName LIKE @companyName)
    `;

    // Fetch paginated data
    const dataSql = `
      SELECT 
        postId, jobTitle, companyName, location, empType,
        experienceLevel, minSalary, maxSalary, postedDate,
        isRemote, jobCategory
      FROM post
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      OFFSET @offsetRows ROWS FETCH NEXT @fetchRows ROWS ONLY;
    `;
    const dataResult = await request.query(dataSql);

    // Fetch total count (same filters, no pagination)
    const countSql = `SELECT COUNT(*) AS total FROM post WHERE ${whereClause};`;
    const countResult = await request.query(countSql);

    res.json({
      jobs: dataResult.recordset,
      total: countResult.recordset[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult.recordset[0].total / limit),
    });
  } catch (err) {
    console.error("MSSQL filter error:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

module.exports = { filterJobs };
