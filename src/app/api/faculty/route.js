import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { depList, facultyTables } from '@/lib/const'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    let results

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
        const profileData = {}

        // Get basic profile
        const userData = await query(
          `SELECT * FROM user WHERE email = ?`,
          [type]
        )

        if (!userData || userData.length === 0) {
          return NextResponse.json(
            { message: 'Faculty not found' },
            { status: 404 }
          )
        }

        profileData.profile = userData[0]

        // Get data from all faculty-related tables
        for (const table of facultyTables) {
          const tableData = await query(
            `SELECT * FROM ${table} WHERE email = ?`,
            [type]
          ).catch(e => {
            console.error(`${table} query error:`, e)
            return null
          })

          // Special handling for certain tables that need JSON parsing
          if (tableData?.length > 0) {
            // Parse JSON fields if they exist
            if (table === 'publications') {
              tableData.forEach(item => {
                if (item.publications) item.publications = JSON.parse(item.publications)
                if (item.pub_pdf) item.pub_pdf = JSON.parse(item.pub_pdf)
              })
            }
            profileData[table] = tableData
          }
        }

        return NextResponse.json(profileData)
    }

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
} 