import db from "@/lib/db";

// ------------------- POST: Create a lecture -------------------
export async function POST(req) {
  const body = await req.json();
  const { institute_name, event_name, topic, lecture_date, start_date, end_date, financed_by, email } = body;

  if (!institute_name || !email) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const result = await db.query(
      `INSERT INTO talks_and_lectures 
       (institute_name, event_name, topic, lecture_date, start_date, end_date, financed_by, email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        institute_name,
        event_name || null,
        topic || null,
        lecture_date || null,
        start_date || null,
        end_date || null,
        financed_by || null,
        email
      ]
    );

    const insertId = result?.insertId || (Array.isArray(result) ? result[0]?.insertId : null);

    return Response.json({ message: "Lecture added successfully", id: insertId }, { status: 201 });
  } catch (err) {
    console.error("POST error:", err.sqlMessage || err.message);
    return Response.json({ error: err.sqlMessage || "Database error" }, { status: 500 });
  }
}

export async function PUT(req) {
  const body = await req.json();
  const { id, institute_name, event_name, topic, lecture_date, start_date, end_date, financed_by, email } = body;

  if (!id || !institute_name || !email) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await db.query(
      `UPDATE talks_and_lectures 
       SET institute_name = ?, event_name = ?, topic = ?, lecture_date = ?, start_date = ?, end_date = ?, financed_by = ? 
       WHERE id = ? AND email = ?`,
      [
        institute_name,
        event_name || null,
        topic || null,
        lecture_date || null,
        start_date || null,
        end_date || null,
        financed_by || null,
        id,
        email
      ]
    );

    return Response.json({ message: "Lecture updated successfully" });
  } catch (err) {
    console.error("PUT error:", err.sqlMessage || err.message);
    return Response.json({ error: err.sqlMessage || "Database error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    await db.query("DELETE FROM talks_and_lectures WHERE id = ?", [id]);
    return Response.json({ message: "Lecture deleted successfully" });
  } catch (err) {
    console.error("DELETE error:", err.sqlMessage || err.message);
    return Response.json({ error: err.sqlMessage || "Database error" }, { status: 500 });
  }
}
