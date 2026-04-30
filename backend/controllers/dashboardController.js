require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

const getPosts = async (req, res) => {
    try {
        const pool = await poolPromise; // ✅ already correct
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

        const pool = await poolPromise; // ✅ fixed here
        const result = await pool.request()
            .input('postId', sql.BigInt, postId)
            .execute('sp_GetPostByID');

        const [postDetails, skills, qualifications] = result.recordsets;

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


const insert_into_post = async (req, res) => {
    try {
        const {
            companyName, jobTitle, description, location,
            empType, jobCategory, experienceLevel,
            minSalary, maxSalary, salCurrency,
            isRemote, skills, qualification
        } = req.body;

        const pool = await poolPromise;

        const result = await pool.request()
            .input('creatorId',       sql.BigInt,           req.user.userID)
            .input('companyName',     sql.VarChar(200),     companyName     ?? null)
            .input('jobTitle',        sql.VarChar(150),     jobTitle)
            .input('description',     sql.VarChar(1000),    description     ?? null)
            .input('location',        sql.VarChar(150),     location        ?? null)
            .input('empType',         sql.VarChar(50),      empType         ?? null)
            .input('jobCategory',     sql.VarChar(100),     jobCategory     ?? null)
            .input('experienceLevel', sql.VarChar(50),      experienceLevel ?? null)
            .input('minSalary',       sql.Decimal(18,2),    minSalary       ?? null)
            .input('maxSalary',       sql.Decimal(18,2),    maxSalary       ?? null)
            .input('salCurrency',     sql.VarChar(10),      salCurrency     ?? 'PKR')
            .input('isRemote',        sql.Bit,              isRemote        ?? 0)
            .input('skillsJson',      sql.NVarChar(sql.MAX), skills        ? JSON.stringify(skills)        : null)
            .input('qualJson',        sql.NVarChar(sql.MAX), qualification  ? JSON.stringify(qualification) : null)
            .execute('sp_CreatePost');

        const spResult = result.recordset[0];

        if (spResult.Status === 'SUCCESS') {
            return res.status(201).json({
                message: 'Post created successfully',
                postId: spResult.PostId
            });
        }

        const statusMap = {
            'USER_NOT_FOUND':           { code: 404, message: 'User not found' },
            'INVALID_SALARY_RANGE':     { code: 400, message: 'Min salary cannot exceed max salary' },
            'ERROR':                    { code: 500, message: spResult.ErrorDetail || 'Database error' },
        };

        const mapped = statusMap[spResult.Status] ?? { code: 500, message: 'Unknown error' };
        return res.status(mapped.code).json({ message: mapped.message });

    } catch (err) {
        console.error('ERROR:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};


const getmypost = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('userId', sql.BigInt, req.user.userID) 
            .query('SELECT * FROM post WHERE creatorId = @userId');

        return res.status(200).json({ status: 'SUCCESS', posts: result.recordset });

    } catch (err) {
        console.error('Get my posts error:', err);
        return res.status(500).json({ status: 'ERROR', message: 'Could not fetch posts' });
    }
};

module.exports = { getPosts, getSinglePost,insert_into_post,getmypost};