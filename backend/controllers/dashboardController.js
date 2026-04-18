const env=require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

const getPosts = async (req, res) => {
    try {
        console.log("USER:", req.user);

        const pool = await poolPromise;

        const result = await pool.request()
            .input('LoggedInUserID', sql.BigInt, req.user.userID)
            .execute('sp_GetAllPosts');

            return res.status(200).json({ status: 'SUCCESS', posts: result.recordset });
       

    } catch (err) {
        console.error('Get posts error FULL:', err);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Could not fetch posts'
        });
    }
};

module.exports = { getPosts };