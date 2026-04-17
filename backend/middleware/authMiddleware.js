const env=require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET ;

const verifyToken = (req, res, next) => 
    {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

    if (!token) 
        {
        return res.status(401).json({ 
            status:  'ERROR', 
            message: 'Access denied. No token provided.' 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { userID, email }
        next();
    } catch (err) {
        return res.status(401).json({ 
            status:  'ERROR', 
            message: 'Invalid or expired token' 
        });
    }
};

module.exports = verifyToken;