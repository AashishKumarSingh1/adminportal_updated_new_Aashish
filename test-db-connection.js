require('dotenv').config();
const { query, healthCheck, getPoolStats } = require('./src/lib/db.js');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test health check
    const isHealthy = await healthCheck();
    console.log('Health check result:', isHealthy);
    
    // Test a simple query
    const result = await query('SELECT 1 as test');
    console.log('Test query result:', result);
    
    // Check pool stats
    const stats = getPoolStats();
    console.log('Pool stats:', stats);
    
    console.log('✅ Database connection test successful!');
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
  }
}

testConnection();
