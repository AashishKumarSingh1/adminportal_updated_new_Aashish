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
        const conference_papers = await query(
          `SELECT * FROM conference_papers`
        );
        return NextResponse.json(conference_papers)

      default:
        if (depList.has(type)) {
          const conference_data = await query(
            `SELECT * FROM user u 
             JOIN conference_papers t 
             ON u.email = t.email 
             WHERE u.department = ?`,
            [depList.get(type)]
          );
          return NextResponse.json(conference_data);
        } else {
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
