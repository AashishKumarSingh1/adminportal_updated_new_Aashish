import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { depList } from '@/lib/const'
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let results
    switch (type) {
      case 'all':
        results = await query(
          `SELECT * FROM sponsored_projects
            ORDER BY end_date DESC`
        );
        const consultancy_projects = await query(
          `SELECT * FROM consultancy_projects
            ORDER BY start_date DESC`
        );
        const data = [...results, ...consultancy_projects];
        return NextResponse.json(data);

        case 'count':
          let sponsoredCount = await query(
            `SELECT COUNT(*) as count FROM sponsored_projects`
          ).catch(error => {
            console.error('Error fetching sponsored project count:', error);
            return null;
          });
          let consultancyCount = await query(
            `SELECT COUNT(*) as count FROM consultancy_projects`
          ).catch(error => {
            console.error('Error fetching consultancy project count:', error);
            return null;
          });
          if (sponsoredCount === null || consultancyCount === null) {
            return NextResponse.json(
              { message: 'Failed to fetch project count' },
              { status: 500 }
            );
          }
          const totalCount = parseInt(sponsoredCount[0].count) + parseInt(consultancyCount[0].count);
          return NextResponse.json({ 
            projectCount: totalCount 
          });
      default:
        if(depList.has(type)){
          results = await query(
            `SELECT * FROM user u 
             JOIN sponsored_projects sp 
             ON u.email = sp.email 
             WHERE u.department = ?`,
            [depList.get(type)]
          )

          let consultancy_projects = await query(
            `SELECT * FROM user u 
             JOIN consultancy_projects cp 
             ON u.email = cp.email 
             WHERE u.department = ?`,
            [depList.get(type)]
          )
          return NextResponse.json([...results, ...consultancy_projects])
        }else{
          return NextResponse.json(
            { message: 'Invalid type parameter' },
            { status: 400 }
          )
        }
    }

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { type, department, from, to } = body

    let results
    switch (type) {
      case 'department':
        // Get projects by department with pagination
        results = await query(
          `SELECT * FROM project 
           WHERE department = ? 
           ORDER BY end DESC 
           LIMIT ?, ?`,
          [department, from, to - from]
        )
        break

      case 'faculty':
        // Get projects by faculty email
        const { email } = body
        results = await query(
          `SELECT * FROM project 
           WHERE email = ? 
           ORDER BY end DESC`,
          [email]
        )
        break

      case 'range':
        // Get projects within date range
        const { start_date, end_date } = body
        results = await query(
          `SELECT * FROM project 
           WHERE start >= ? AND end <= ? 
           ORDER BY end DESC 
           LIMIT ?, ?`,
          [start_date, end_date, from, to - from]
        )
        break

      case 'search':
        // Search projects by keyword
        const { keyword = '' } = body
        results = await query(
          `SELECT * FROM project 
           WHERE project LIKE ? OR sponsor LIKE ? 
           ORDER BY end DESC 
           LIMIT ?, ?`,
          [`%${keyword}%`, `%${keyword}%`, from, to - from]
        )
        break

      default:
        return NextResponse.json(
          { message: 'Invalid type parameter' },
          { status: 400 }
        )
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
} 