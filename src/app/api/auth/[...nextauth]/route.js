import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import mysql from 'mysql2/promise'
import { ROLES, ROLE_NAMES } from '@/lib/roles'
import { authOptions } from '@/lib/authOptions'
// Create connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Helper function for database queries
async function query(sql, values) {
  const [rows] = await pool.execute(sql, values)
  return rows
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 