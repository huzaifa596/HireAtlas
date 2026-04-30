const express    = require('express');
const router     = express.Router();
const { getPosts,getSinglePost,insert_into_post,getmypost} = require('../controllers/dashboardController');
const verifyToken = require('../middleware/authMiddleware');


router.get('/posts', verifyToken, getPosts);
router.get('/posts/:postId', verifyToken, getSinglePost);
router.post('/posts/createPost', verifyToken, insert_into_post);
router.get('/myposts',verifyToken,getmypost);

module.exports = router;