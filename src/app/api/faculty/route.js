import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { depList, facultyTables } from '@/lib/const'

const allowedOrigins = [
  "https://adminportal-updated-new.vercel.app/",  
  'http://localhost:3000',
  'https://faculty-performance-appraisal-performa.vercel.app/',
  
  // Add other allowed domains
]

export async function GET(request) {
  try {
    // Add CORS headers
    const response = NextResponse
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    let results

    const origin = request.headers.get('origin')
    const isAllowedOrigin = allowedOrigins.includes(origin)

    switch (type) {
      case 'all':
        results = await query(
          `SELECT 
            u.*, 
            CASE u.role 
              WHEN 1 THEN 'SUPER_ADMIN'
              WHEN 2 THEN 'ACADEMIC_ADMIN'
              WHEN 3 THEN 'FACULTY'
              WHEN 4 THEN 'OFFICER'
              WHEN 5 THEN 'STAFF'
              WHEN 6 THEN 'DEPT_ADMIN'
            END as role_name
          FROM user u 
          ORDER BY u.name ASC`
        )
        // Transform the results to include role name
        return NextResponse.json(results.map(user => ({
          ...user,
          role: user.role_name // Replace numeric role with string role
        })))

      case 'faculties':
        results = []
        const departments = [...depList.values()]
        
        // Fetch faculty from each department
        for (let i = 0; i < departments.length - 1; i++) {
          const data = await query(
            `SELECT * FROM user WHERE department = ? ORDER BY name ASC`,
            [departments[i]]
          ).catch(e => console.error('Department query error:', e))
          
          if (data) {
            results = [...results, ...data]
          }
        }
        return NextResponse.json(results.sort())

      case 'count':
        const countResult = await query(
          `SELECT COUNT(*) as count FROM user`
        )
        return NextResponse.json({ 
          facultyCount: countResult[0].count 
        })

      default:
        // Check if it's a department query
        if (depList.has(type)) {
          results = await query(
            `SELECT * FROM user WHERE department = ?`,
            [depList.get(type)]
          )
          return NextResponse.json(results)
        }

        // Individual faculty profile query
        // Optimized: Get user profile data first
        const profileResult = await query(
          `SELECT * FROM user WHERE email = ?`,
          [type]
        )

        if (profileResult.length === 0) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const profileData = {
          profile: profileResult[0]
        }

        // Super-optimized: Create a single UNION query instead of multiple individual queries
        const nonEmptyTables = []
        const emptyTables = []
        
        // First, let's do a quick check to see which tables have data
        const quickCheckQuery = `
          ${facultyTables.map(table => {
            if (table === "patents") {
              return `SELECT '${table}' as table_name, COUNT(*) as count FROM ipr WHERE email = ? AND type = "Patent"`
            } else if (table === "user") {
              return `SELECT '${table}' as table_name, 1 as count` // Skip user table
            } else {
              return `SELECT '${table}' as table_name, COUNT(*) as count FROM ${table} WHERE email = ?`
            }
          }).join(' UNION ALL ')}
        `
        
        // Execute count check for all tables at once
        const tableCounts = await query(quickCheckQuery, Array(facultyTables.length).fill(type))
        
        // Separate tables with data from empty tables
        tableCounts.forEach(({ table_name, count }) => {
          if (count > 0 && table_name !== 'user') {
            nonEmptyTables.push(table_name)
          } else {
            emptyTables.push(table_name)
          }
        })

        // Only query tables that have data - parallel execution for non-empty tables only
        if (nonEmptyTables.length > 0) {
          const dataQueries = nonEmptyTables.map(async (table) => {
            try {
              let queryString;
              if (table === "patents") {
                queryString = `SELECT *, '${table}' as source_table FROM ipr WHERE email = ? AND type = "Patent"`
              } else {
                queryString = `SELECT *, '${table}' as source_table FROM ${table} WHERE email = ?`
              }
              
              const tableData = await query(queryString, [type])
              return { table, data: tableData }
            } catch (e) {
              console.error(`${table} query error:`, e)
              return { table, data: null }
            }
          })

          // Execute only necessary queries in parallel
          const tableResults = await Promise.all(dataQueries)
          
          // Process results
          tableResults.forEach(({ table, data }) => {
            if (data && data.length > 0) {
              // Remove the source_table field we added for identification
              const cleanData = data.map(item => {
                const { source_table, ...cleanItem } = item
                return cleanItem
              })
              
              // Special handling for certain tables that need JSON parsing
              if (table === 'publications') {
                cleanData.forEach(item => {
                  if (item.publications) item.publications = JSON.parse(item.publications)
                  if (item.pub_pdf) item.pub_pdf = JSON.parse(item.pub_pdf)
                })
              }
              profileData[table] = cleanData
            }
          })
        }

        return NextResponse.json(profileData)
    }

    // Return response with CORS headers
    return NextResponse.json(results, {
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true', // If you need to support credentials
      },
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    )
  }
}

// Handle OPTIONS requests
export async function OPTIONS(request) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 