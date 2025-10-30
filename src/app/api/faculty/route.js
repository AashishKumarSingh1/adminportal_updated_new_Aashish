import { NextResponse } from 'next/server'
import { query, parallel, batchQuery } from '@/lib/db'
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

     const facultyTables = [
      'about_me',
      'book_chapters',
      'conference_papers',
      'conference_session_chairs',
      'consultancy_projects',
      'department_activities',
      'edited_books',
      'education',
      'events',
      'faculty_image',
      'innovation',
      'institute_activities',
      'international_journal_reviewers',
      'internships',
      'ipr',
      'journal_papers',
      'memberships',
      'news',
      'notices',
      'patents',
      'phd_candidates',
      'project_supervision',
      'sponsored_projects',
      'startups',
      'talks_and_lectures',
      'teaching_engagement',
      'textbooks',
      'webteam',
      'work_experience',
      'workshops_conferences',
      "user",
      "honours_awards",
      "special_lectures",
      "visits_abroad",
      'editorial_boards',
      'mooc_courses'
    ];

    let subqueries = facultyTables.map(
            (table) => `(SELECT COUNT(*) FROM ${table} WHERE email = u.email) AS ${table}_count`
          );

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
            END as role_name,
            ${subqueries.join(',\n    ')}
              FROM user u 
              WHERE u.is_deleted = 0
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
            `SELECT * FROM user WHERE department = ? AND is_deleted = 0 ORDER BY name ASC`,
            [departments[i]]
          ).catch(e => console.error('Department query error:', e))
          
          if (data) {
            results = [...results, ...data]
          }
        }
        return NextResponse.json(results.sort())

      case 'count':
        const countResult = await query(
          `SELECT COUNT(*) as count FROM user WHERE is_deleted = 0`
        )
        return NextResponse.json({ 
          facultyCount: countResult[0].count 
        })

      default:
        // Check if it's a department query
        if (depList.has(type)) {
          results = await query(
            `SELECT 
            u.*, 
            ${subqueries.join(',\n    ')}
              FROM user u
              where department = ? AND u.is_deleted = 0`,
            [depList.get(type)]
          )
          return NextResponse.json(results)
        }

        // Individual faculty profile query - OPTIMIZED WITH CONNECTION POOLING
        console.log(`[Faculty API] Fetching data for: ${type}`)
        const startTime = Date.now()
        
        // Get user profile data first
        const profileResult = await query(
            `SELECT * FROM user WHERE email = ? AND is_deleted = 0`,
          [type]
        )

        if (profileResult.length === 0) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const profileData = {
          profile: profileResult[0]
        }

        // Define all tables we need to query (excluding user which we already have)
        const dataQueries = [
          { table: 'about_me', query: 'SELECT * FROM about_me WHERE email = ?' },
          { table: 'education', query: 'SELECT * FROM education WHERE email = ?' },
          { table: 'work_experience', query: 'SELECT * FROM work_experience WHERE email = ?' },
          { table: 'journal_papers', query: 'SELECT * FROM journal_papers WHERE email = ?' },
          { table: 'conference_papers', query: 'SELECT * FROM conference_papers WHERE email = ?' },
          { table: 'book_chapters', query: 'SELECT * FROM book_chapters WHERE email = ?' },
          { table: 'edited_books', query: 'SELECT * FROM edited_books WHERE email = ?' },
          { table: 'textbooks', query: 'SELECT * FROM textbooks WHERE email = ?' },
          { table: 'patents', query: 'SELECT * FROM ipr WHERE email = ? AND type = "Patent"' },
          { table: 'sponsored_projects', query: 'SELECT * FROM sponsored_projects WHERE email = ?' },
          { table: 'consultancy_projects', query: 'SELECT * FROM consultancy_projects WHERE email = ?' },
          { table: 'project_supervision', query: 'SELECT * FROM project_supervision WHERE email = ?' },
          { table: 'phd_candidates', query: 'SELECT * FROM phd_candidates WHERE email = ?' },
          { table: 'internships', query: 'SELECT * FROM internships WHERE email = ?' },
          { table: 'teaching_engagement', query: 'SELECT * FROM teaching_engagement WHERE email = ?' },
          { table: 'workshops_conferences', query: 'SELECT * FROM workshops_conferences WHERE email = ?' },
          { table: 'institute_activities', query: 'SELECT * FROM institute_activities WHERE email = ?' },
          { table: 'department_activities', query: 'SELECT * FROM department_activities WHERE email = ?' },
          { table: 'memberships', query: 'SELECT * FROM memberships WHERE email = ?' },
          { table: 'ipr', query: 'SELECT * FROM ipr WHERE email = ?' },
          { table: 'startups', query: 'SELECT * FROM startups WHERE email = ?' },
          { table: 'conference_session_chairs', query: 'SELECT * FROM conference_session_chairs WHERE email = ?' },
          { table: 'international_journal_reviewers', query: 'SELECT * FROM international_journal_reviewers WHERE email = ?' },
          { table: 'talks_and_lectures', query: 'SELECT * FROM talks_and_lectures WHERE email = ?' },

          {table:"honours_awards",query:"SELECT * FROM honours_awards WHERE email = ?"},
          {table:"special_lectures",query:"SELECT * FROM special_lectures WHERE email = ?"},
          {table:"visits_abroad",query:"SELECT * FROM visits_abroad WHERE email = ?"},
          {table:"editorial_boards",query:"SELECT * FROM editorial_boards WHERE email = ?"},
          {table:"mooc_courses",query:"SELECT * FROM mooc_courses WHERE email = ?"},
        ]

        try {
          // Execute ALL queries using a single connection from pool for better performance
          console.log(`[Faculty API] Executing ${dataQueries.length} queries with single connection...`)
          
          // Use the new batchQuery function from db.js (single connection)
          const batchQueries = dataQueries.map(({ query: q }) => ({ query: q, values: [type] }))
          const results = await batchQuery(batchQueries)
          
          // Map results back to table names
          dataQueries.forEach(({ table }, index) => {
            const tableData = results[index]
            if (tableData && tableData.length > 0) {
              // Special handling for publications that need JSON parsing
              if (table === 'publications' || table === 'journal_papers') {
                tableData.forEach(item => {
                  try {
                    if (item.publications) item.publications = JSON.parse(item.publications)
                    if (item.pub_pdf) item.pub_pdf = JSON.parse(item.pub_pdf)
                  } catch (e) {
                    // Skip JSON parsing errors
                  }
                })
              }
              profileData[table] = tableData
            } else {
              profileData[table] = []
            }
          })
          
          const endTime = Date.now()
          console.log(`[Faculty API] Completed in ${endTime - startTime}ms using connection pool`)
          
          return NextResponse.json(profileData)
          
        } catch (error) {
          console.error('[Faculty API] Parallel query error:', error)
          // Fallback to empty data structure instead of failing
          dataQueries.forEach(({ table }) => {
            if (!profileData[table]) {
              profileData[table] = []
            }
          })
          return NextResponse.json(profileData)
        }
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