const express    = require('express');
const router     = express.Router();
const { getPosts,getSinglePost} = require('../controllers/dashboardController');

const verifyToken = require('../middleware/authMiddleware');


router.get('/posts', verifyToken, getPosts);
router.get('/posts/:postId', verifyToken, getSinglePost);

module.exports = router;