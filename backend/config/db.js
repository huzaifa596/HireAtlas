const env = require("dotenv").config();
const sql = require("mssql/msnodesqlv8");

const isWindowsAuth = !process.env.DB_USER && !process.env.DB_PASSWORD;


const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,

  connectionString: isWindowsAuth
    ? "Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=freshdb;Trusted_Connection=yes;"
    : null,

  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
  
};


if (isWindowsAuth) {
  delete dbConfig.user;
  delete dbConfig.password;
}

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log(`Connection successfull via ${isWindowsAuth ? "Windows" : "SQL"} Auth`);
    return pool;
  })
  .catch((err) => {
    console.error(" ERROR .DB Connection Failed:", err.message);
  });

module.exports = { sql, poolPromise };
