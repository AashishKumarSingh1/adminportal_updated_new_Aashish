import { NextResponse } from 'next/server'
import { healthCheck, getPoolStats } from '@/lib/db'

export async function GET() {
  try {
    // Check database health
    const isHealthy = await healthCheck()
    
    // Get connection pool statistics
    const poolStats = getPoolStats()
    
    const response = {
      database: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      },
      connectionPool: {
        total: poolStats.totalConnections,
        active: poolStats.activeConnections,
        available: poolStats.availableConnections,
        queued: poolStats.queuedRequests,
        utilization: `${((poolStats.activeConnections / poolStats.totalConnections) * 100).toFixed(1)}%`
      }
    }
    
    return NextResponse.json(response, { 
      status: isHealthy ? 200 : 500,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      database: {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
