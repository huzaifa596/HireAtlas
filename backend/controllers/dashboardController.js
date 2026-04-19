require('dotenv').config();
const { sql, poolpromise } = require('../config/db');

const getPosts = async (req, res) => {
    try {
        const pool = await poolpromise;
        const result = await pool.request()
            .input('LoggedInUserID', sql.BigInt, req.user.userID)
            .execute('sp_GetAllPosts');

        return res.status(200).json({ status: 'SUCCESS', posts: result.recordset });

    } catch (err) {
        console.error('Get posts error:', err);
        return res.status(500).json({ status: 'ERROR', message: 'Could not fetch posts' });
    }
};

const getSinglePost = async (req, res) => {
    try {
        const postId = parseInt(req.params.postId);

        if (!postId || isNaN(postId)) {
            return res.status(400).json({ status: 'ERROR', message: 'Invalid post ID' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('postId', sql.BigInt, postId)
            .execute('sp_GetPostByID');

        // SP returns 3 result sets
        const [postDetails, skills, qualifications] = result.recordsets;

        // Handle POST_NOT_FOUND status returned from SP
        if (postDetails[0]?.Status === 'POST_NOT_FOUND') {
            return res.status(404).json({ status: 'ERROR', message: 'Post not found' });
        }

        return res.status(200).json({
            status: 'SUCCESS',
            post: {
                ...postDetails[0],
                skills,
                qualifications
            }
        });

    } catch (err) {
        console.error('Get single post error:', err);
        return res.status(500).json({ status: 'ERROR', message: 'Could not fetch post' });
    }
};

module.exports = { getPosts, getSinglePost };