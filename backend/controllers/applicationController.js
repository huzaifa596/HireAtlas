// controllers/applicationController.js
require("dotenv").config();
const { sql, poolPromise } = require("../config/db");

// ──────────────────────────────────────────────
// POST /api/applications
// Body: { postId }
// ──────────────────────────────────────────────
const submitApplication = async (req, res) => {
  const { postId } = req.body;
  const applicantId = req.user.userId;

  if (!postId) {
    return res.status(400).json({ message: "postId is required." });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("postId", sql.BigInt, postId)
      .input("applicantId", sql.BigInt, applicantId)
      .execute("sp_SubmitApplication");

    const row = result.recordset[0];

    return res.status(201).json({
      message: "Application submitted successfully.",
      applicationId: row.applicationId,
    });
  } catch (err) {
    const msg = err.message?.trim();

    // CV missing on profile — specific actionable error
    if (msg === "NO_CV_ON_PROFILE") {
      return res.status(422).json({
        code: "NO_CV_ON_PROFILE",
        message: "Please upload your CV in your profile before applying.",
      });
    }

    // Other business-rule errors raised by the SP
    if (err.number === 50000 || err.class === 16) {
      return res.status(409).json({ message: msg });
    }

    console.error("submitApplication:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { submitApplication };
