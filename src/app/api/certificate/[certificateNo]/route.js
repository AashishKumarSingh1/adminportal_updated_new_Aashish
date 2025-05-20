import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  const certificateNo = params.certificateNo;

  if (!certificateNo) {
    return NextResponse.json(
      { error: 'Certificate number is required' },
      { status: 400 }
    );
  }

  try {
    // Query to get certificate and member data
    const queryStr = `
      SELECT c.*, w.* 
      FROM Certificate c
      JOIN webteam w ON c.webteamId = w.id
      WHERE c.certificate_no = ?
    `;

    // Execute the query using the imported query function
    const rows = await query(queryStr, [certificateNo]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Format the response
    const result = rows[0];
    
    const certificate = {
      id: result.id,
      certificate_no: result.certificate_no,
      generated_on: result.generated_on,
      webteamId: result.webteamId
    };

    const member = {
      id: result.webteamId,
      name: result.name,
      desg: result.desg,
      image: result.image,
      interests: result.interests,
      url: result.url,
      email: result.email,
      year: result.year,
      role: result.role
    };

    return NextResponse.json({ certificate, member });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}