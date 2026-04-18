const express    = require('express');
const router     = express.Router();
const { getPosts} = require('../controllers/dashboardController');

const verifyToken = require('../middleware/authMiddleware');


router.get('/posts', verifyToken, getPosts);


module.exports = router;