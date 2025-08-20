import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { type, email, id, start_date, end_date } = body;
    const validEndDate = end_date === "continue" ? null : end_date;

    let sql, params;

    switch (type) {
      case "honours_awards":
        sql = id
          ? `UPDATE honours_awards SET honour_award=?, start_date=?, end_date=? WHERE id=?`
          : `INSERT INTO honours_awards (id, email, honour_award, start_date, end_date) VALUES (?, ?, ?, ?, ?)`;
        params = id
          ? [body.honour_award, start_date, validEndDate, id]
          : [Date.now().toString(), email, body.honour_award, start_date, validEndDate];
        break;

      case "special_lectures":
        sql = id
          ? `UPDATE special_lectures SET topic=?, institute_name=?, start_date=?, end_date=?, financed_by=? WHERE id=?`
          : `INSERT INTO special_lectures (id, email, topic, institute_name, start_date, end_date, financed_by) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        params = id
          ? [body.topic, body.institute_name, start_date, validEndDate, body.financed_by, id]
          : [Date.now().toString(), email, body.topic, body.institute_name, start_date, validEndDate, body.financed_by];
        break;

      case "visits_abroad":
        sql = id
          ? `UPDATE visits_abroad SET country=?, start_date=?, end_date=?, purpose=?, funded_by=? WHERE id=?`
          : `INSERT INTO visits_abroad (id, email, country, start_date, end_date, purpose, funded_by) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        params = id
          ? [body.country, start_date, validEndDate, body.purpose, body.funded_by, id]
          : [Date.now().toString(), email, body.country, start_date, validEndDate, body.purpose, body.funded_by];
        break;

      case "editorial_boards":
        sql = id
          ? `UPDATE editorial_boards SET position=?, journal_name=?, start_date=?, end_date=? WHERE id=?`
          : `INSERT INTO editorial_boards (id, email, position, journal_name, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)`;
        params = id
          ? [body.position, body.journal_name, start_date, validEndDate, id]
          : [Date.now().toString(), email, body.position, body.journal_name, start_date, validEndDate];
        break;

      case "mooc_courses":
        sql = id
          ? `UPDATE mooc_courses SET course_code=?, course_name=?, start_date=?, end_date=?, status=? WHERE id=?`
          : `INSERT INTO mooc_courses (id, email, course_code, course_name, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        params = id
          ? [body.course_code, body.course_name, start_date, validEndDate, body.status, id]
          : [Date.now().toString(), email, body.course_code, body.course_name, start_date, validEndDate, body.status];
        break;

      default:
        return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    const result = await query(sql, params);
    return NextResponse.json(
      { message: id ? "Updated successfully" : "Inserted successfully", result },
      { status: 200 }
    );
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ message: "Database error", error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const type = searchParams.get("type");

    if (!email || !type) {
      return NextResponse.json({ message: "Email and type required" }, { status: 400 });
    }

    let table;
    switch (type) {
      case "honours_awards": table = "honours_awards"; break;
      case "special_lectures": table = "special_lectures"; break;
      case "visits_abroad": table = "visits_abroad"; break;
      case "editorial_boards": table = "editorial_boards"; break;
      case "mooc_courses": table = "mooc_courses"; break;
      default: return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    const result = await query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json({ message: "ID and type required" }, { status: 400 });
    }

    let table;
    switch (type) {
      case "honours_awards": table = "honours_awards"; break;
      case "special_lectures": table = "special_lectures"; break;
      case "visits_abroad": table = "visits_abroad"; break;
      case "editorial_boards": table = "editorial_boards"; break;
      case "mooc_courses": table = "mooc_courses"; break;
      default: return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    const result = await query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ message: "Error deleting record", error: error.message }, { status: 500 });
  }
}
