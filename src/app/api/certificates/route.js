import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    // Query to get all certificates with member details
    const queryStr = `
      SELECT 
        c.id as certificate_id,
        c.certificate_no,
        c.generated_on,
        c.webteamId,
        w.name,
        w.email,
        w.desg,
        w.year,
        w.role,
        w.image,
        w.interests,
        w.url
      FROM Certificate c
      JOIN webteam w ON c.webteamId = w.id
      ORDER BY c.generated_on DESC
    `;

    // Execute the query using the imported query function
    const rows = await query(queryStr);

    // Format the response
    const certificates = rows.map(row => ({
      certificate_id: row.certificate_id,
      certificate_no: row.certificate_no,
      generated_on: row.generated_on,
      webteamId: row.webteamId,
      member: {
        id: row.webteamId,
        name: row.name,
        designation: row.desg,
       image: row.image,
        email: row.email,
        interests: row.interests,
        url: row.url,
        year: row.year,
        role: row.role
      }
    }));

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}