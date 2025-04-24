import db from '@/lib/db';

export async function POST(req) {
  const { institute_name, event_name, date, email } = await req.json();

  if (!institute_name || !event_name || !date || !email) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await db.query(
      'INSERT INTO talks_and_lectures (institute_name, event_name, date, email) VALUES (?, ?, ?, ?)',
      [institute_name, event_name, date, email]
    );
    return Response.json({ message: 'Lecture added successfully' }, { status: 201 });
  } catch (err) {
    console.error('POST error:', err);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(req) {
  const { id, institute_name, event_name, date, email } = await req.json();

  if (!id || !institute_name || !event_name || !date || !email) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await db.query(
      'UPDATE talks_and_lectures SET institute_name = ?, event_name = ?, date = ? WHERE id = ? AND email = ?',
      [institute_name, event_name, date, id, email]
    );
    return Response.json({ message: 'Lecture updated successfully' });
  } catch (err) {
    console.error('PUT error:', err);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    await db.query('DELETE FROM talks_and_lectures WHERE id = ?', [id]);
    return Response.json({ message: 'Lecture deleted successfully' });
  } catch (err) {
    console.error('DELETE error:', err);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
}
