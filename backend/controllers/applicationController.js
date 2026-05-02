// controllers/applicationController.js
require("dotenv").config();
const { sql, poolPromise } = require("../config/db");

const submitApplication = async (req, res) => {
  const postId = parseInt(req.params.postId);
  const applicantId = req.user.userID;

  if (!postId || isNaN(postId)) {
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

//===============================================================================

const getMyApplications = async (req, res) => {
  const applicantId = req.user.userID;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("applicantId", sql.BigInt, applicantId)
      .execute("sp_GetMyApplications");

    return res.status(200).json({
      applications: result.recordset,
    });
  } catch (err) {
    console.error("getMyApplications:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getPostCandidates = async (req, res) => {
  const postId = parseInt(req.params.postId);
  const employerId = req.user.userID;

  if (!postId || isNaN(postId)) {
    return res.status(400).json({ message: "postId is required." });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("postId", sql.BigInt, postId)
      .input("employerId", sql.BigInt, employerId)
      .execute("sp_GetPostCandidates");

    return res.status(200).json({
      applications: result.recordset,
    });
  } catch (err) {
    const msg = err.message?.trim();

    if (err.number === 50000 || err.class === 16) {
      return res.status(403).json({ message: msg });
    }

    console.error("getPostCandidates:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const updateApplicationStatus = async (req, res) => {
  const applicationId = parseInt(req.params.applicationId);
  const { status } = req.body;
  const employerId = req.user.userID;

  if (!status) {
    return res.status(400).json({ message: "status is required." });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("applicationId", sql.BigInt, applicationId)
      .input("employerId", sql.BigInt, employerId)
      .input("newStatus", sql.VarChar(50), status)
      .execute("sp_UpdateApplicationStatus");

    const row = result.recordset[0];

    return res.status(200).json({
      message: "Status updated successfully.",
      applicationId: row.applicationId,
      status: row.status,
    });
  } catch (err) {
    const msg = err.message?.trim();

    if (err.number === 50000 || err.class === 16) {
      return res.status(403).json({ message: msg });
    }

    console.error("updateApplicationStatus:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getPostCandidates,
  updateApplicationStatus,
};
