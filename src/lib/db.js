const mysql = require('serverless-mysql');

// Create database connection with basic optimization
const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    port: parseInt(process.env.MYSQL_PORT, 10),
  },
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
 * Executes a MySQL query with performance monitoring.
 * @param {string} q - The SQL query string.
 * @param {Array<string|number>} [values=[]] - Query parameters to be escaped.
 * @returns {Promise<any>} - The query result.
 */
async function query(q, values = []) {
  try {
    const startTime = Date.now();
    const results = await db.query(q, values);
    const endTime = Date.now();
    
    // Log slow queries (> 1 second) in development
    if (process.env.NODE_ENV === 'development' && (endTime - startTime) > 1000) {
      //console.warn(`Slow query detected (${endTime - startTime}ms):`, q.substring(0, 100));
    }
    
    return results;
  } catch (e) {
    console.error('Database Query Error:', {
      query: q.substring(0, 100),
      error: e.message,
      values: values.length
    });
    throw new Error(`Database query failed: ${e.message}`);
  }
}

/**
 * Closes the MySQL connection.
 * Use this explicitly if required in your workflow.
 */
async function closeConnection() {
  try {
    await db.end();
  } catch (e) {
    console.error('Error closing MySQL connection:', e);
  }
}

module.exports = {
  db,
  query,
  closeConnection,
};
