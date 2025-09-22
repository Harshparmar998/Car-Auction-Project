const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'revupbids',
});

module.exports = pool; // ✅ Export the pool
