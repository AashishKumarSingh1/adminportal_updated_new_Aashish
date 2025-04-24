import db from '@/lib/db';

export async function POST(req) {
  const { conference_name, institute_name, place, from_date, to_date, email } = await req.json();

  if (!conference_name || !institute_name || !from_date || !to_date || !email) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await db.query(
      `INSERT INTO conference_session_chairs 
        (conference_name, institute_name, place, from_date, to_date, email) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [conference_name, institute_name, place || null, from_date, to_date, email]
    );
    return Response.json({ message: 'Session Chair added successfully' }, { status: 201 });
  } catch (err) {
    console.error('POST error:', err);
    return Response.json({ error: 'Failed to add session chair' }, { status: 500 });
  }
}

export async function PUT(req) {
  const { id, conference_name, institute_name, place, from_date, to_date, email } = await req.json();

  if (!id || !conference_name || !institute_name || !from_date || !to_date || !email) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await db.query(
      `UPDATE conference_session_chairs 
       SET conference_name = ?, institute_name = ?, place = ?, from_date = ?, to_date = ? 
       WHERE id = ? AND email = ?`,
      [conference_name, institute_name, place || null, from_date, to_date, id, email]
    );

    return Response.json({ message: 'Session Chair updated successfully' });
  } catch (err) {
    console.error('PUT error:', err);
    return Response.json({ error: 'Failed to update session chair' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
  await db.query(
      `DELETE FROM conference_session_chairs WHERE id = ?`,
      [id]
    );

    return Response.json({ message: 'Session Chair deleted successfully' });
  } catch (err) {
    console.error('DELETE error:', err);
    return Response.json({ error: 'Failed to delete session chair' }, { status: 500 });
  }
}
