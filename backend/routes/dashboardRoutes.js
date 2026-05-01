const express = require("express");
const router = express.Router();
const {
  getPosts,
  getSinglePost,
  insert_into_post,
  getmypost,
  deleteMyPost,
} = require("../controllers/dashboardController");
const verifyToken = require("../middleware/authMiddleware");
const { filterJobs } = require("../controllers/filterContoller");
router.get("/posts", verifyToken, getPosts);
router.get("/myposts", verifyToken, getmypost);
router.post("/deletepost", verifyToken, deleteMyPost);
router.get("/posts/:postId", verifyToken, getSinglePost);
router.post("/posts/createPost", verifyToken, insert_into_post);
router.get("/filter/filteredJobs", verifyToken, filterJobs);
module.exports = router;
