const env=require('dotenv').config();
const sql = require('mssql/msnodesqlv8');

const isWindowsAuth = !process.env.DB_USER && !process.env.DB_PASSWORD;

const dbConfig = {
    server: 'localhost',
    database: 'hireatlas',
    // We define the driver connection string for Windows Auth
    connectionString: isWindowsAuth 
        ? 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=hireatlas;Trusted_Connection=yes;'
        : null,
    // Standard config for SQL Auth (your buddy)
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ,
    options: {
        instanceName: 'SQLEXPRESS',
        encrypt: false,
        trustServerCertificate: true,
        trustedConnection: isWindowsAuth
    }
};

// If Windows Auth, we remove user/pass so they don't conflict
if (isWindowsAuth) {
    delete dbConfig.user;
    delete dbConfig.password;
}

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log(`✅ Connected via ${isWindowsAuth ? 'Windows' : 'SQL'} Auth`);
        return pool;
    })
    .catch(err => {
        console.error('❌ DB Connection Failed:', err.message);
    });

module.exports = { sql, poolPromise };