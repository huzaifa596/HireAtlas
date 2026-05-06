const env=require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');
const fs = require('fs').promises;  

const JWT_SECRET = process.env.JWT_SECRET;



// sign up
const signup = async (req, res) => {
    const { name, email, phone, age, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ 
            status:  'ERROR', 
            message: 'Name, email and password are required' 
        });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        const pool   = await poolPromise;
        const result = await pool.request()
            .input('Name', sql.VarChar(100), name)
            .input('Email', sql.VarChar(150), email)
            .input('Phone', sql.VarChar(20),  phone || null)
            .input('Age', sql.Int, age  || null)
            .input('Password', sql.VarChar(255), passwordHash)
            .execute('SignupUser');

        const response = result.recordset[0];

        if (response.Status === 'EMAIL_ALREADY_EXISTS') 
            {
            return res.status(409).json({ 
                status:  'ERROR', 
                message: 'Email already registered' 
            });
        }

        if (response.Status === 'INVALID_AGE') {
            return res.status(400).json({ 
                status:  'ERROR', 
                message: 'Age must be 15 or above' 
            });
        }

        await fs.appendFile('log.txt', `New user signed up: ${email}\n time: ${new Date().toISOString()}\n`);  

        return res.status(201).json({
            status:  'SUCCESS',
            message: 'Account created successfully',
            userID:  response.UserID
        });

    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ 
            status:  'ERROR', 
            message: 'Internal server error' 
        });
    }
};


// LOGIN

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ 
            status:  'ERROR', 
            message: 'Email and password are required' 
        });
    }

    try {
        const pool   = await poolPromise;
        const result = await pool.request()
            .input('Email', sql.VarChar(150), email)
            .execute('LoginUser');

        const user = result.recordset[0];

        if (!user || user.Status === 'USER_NOT_FOUND') {
            return res.status(404).json({ 
                status:  'ERROR', 
                message: 'Invalid email or password' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ 
                status:  'ERROR', 
                message: 'Invalid email or password' 
            });
        }

        const token = jwt.sign(
    { userID: user.userId, email: user.email },  
    JWT_SECRET,
    { expiresIn: '7d' }
);

        await fs.appendFile('log.txt', `User logged in: ${email}\n time: ${new Date().toISOString()}\n`);  // ✅ awaited
        return res.status(200).json({
    status:  'SUCCESS',
    message: 'Login successful',
    token,
    user: {
        userID: user.userId,  
        name:   user.name,    
        email:  user.email    
    }
});

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ 
            status:  'ERROR', 
            message: 'Internal server error' 
        });
    }
};

module.exports = { signup, login };