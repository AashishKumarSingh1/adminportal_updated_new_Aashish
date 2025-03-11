import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Validate environment variables at startup
if (
  !process.env.MYSQL_HOST ||
  !process.env.MYSQL_DATABASE ||
  !process.env.MYSQL_USERNAME ||
  !process.env.MYSQL_PASSWORD ||
  !process.env.MYSQL_PORT
) {
  throw new Error('Missing one or more required MySQL environment variables.');
}

/**
 * Executes a MySQL query.
 * @param {string} sql - The SQL query string.
 * @param {Array<string|number>} values - Query parameters to be escaped.
 * @returns {Promise<any>} - The query result.
 */
export async function query(sql, values) {
  try {
    const [results] = await pool.execute(sql, values);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database query failed: ' + error.message);
  }
}

// Add a health check function
export async function checkConnection() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}
