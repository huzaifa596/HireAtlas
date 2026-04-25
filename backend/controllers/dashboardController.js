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


// const insert_into_post=async (req,res)=>{
 
//     try{
//     const {companyName,jobTitle,description,location,empType,jobCategory,experienceLevel,minsalary,maxsalary,skillsjson,qualjson,isRemote}=req.body

//     const pool   = await poolPromise;
//     const result=await pool.request()
//     .input('creatorId' ,sql.BigInt,req.user.userID)
//     .input('companyName',sql.VarChar(200),companyName)
//     .input('jobTitle',sql.varchar(150),jobTitle)
//     .input('empType',sql.varchar(50),empType)
//     .input('jobCategory',sql.varchar(100),jobCategory)
//     .input('experienceLevel',sql.varchar(100),experienceLevel)
//     .input('minsalary',sql.decimal(18,2),minsalary)
//     .input('maxsalary',sql.decimal(18,2),maxsalary)
//     .input('minsalary',sql.decimal(18,2),minsalary)
//     .input('isRemote',sql.Bit,isRemote)
//     .input('skillsjson',sql.NVarChar(MAX),skillsjson)
//     .input('qualjson',sql.NVarChar(MAX),qualjson)
//     .execute('sp_CreatePost');

//     const response=result.recordset[]
//     }
//     catch(err)
//     {
//         console.log('ERROR:',err);
//     }

    
// }



module.exports = { getPosts, getSinglePost};