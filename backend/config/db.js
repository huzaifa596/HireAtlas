const sql = require('mssql');
// 👆 remove the zod import, you don't need it here

const config = {
    user:     'sa',
    password: 'huzaifa123',
    server:   'localhost',
    database: 'hireatlas',
    // port: 1433,  // SQL Server default port - you can remove this line
    options: {
        instanceName:           'SQLEXPRESS',
        encrypt:                false,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Connected to SQL Server');
        return pool;
    })
    .catch(err => console.error('❌ DB Connection Failed:', err));

module.exports = { sql, poolPromise };