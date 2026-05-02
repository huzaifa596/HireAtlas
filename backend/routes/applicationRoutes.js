// routes/applicationRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

const {
  submitApplication,
  getMyApplications,
  getPostCandidates,
  updateApplicationStatus,
} = require("../controllers/applicationController");

router.post("/:postId", verifyToken, submitApplication);
router.get("/", verifyToken, getMyApplications);
router.get("/post/:postId", verifyToken, getPostCandidates);
router.patch("/:applicationId/status", verifyToken, updateApplicationStatus);

module.exports = router;
