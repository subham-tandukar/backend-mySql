const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME,DB_PORT } = process.env;
const mysql = require("mysql2");

const connectDB = () => {
  return mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
  });
};

module.exports = connectDB;
