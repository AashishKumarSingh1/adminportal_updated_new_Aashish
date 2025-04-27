import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get counts for all tables
    const counts = {}

    // Faculty counts
    const facultyCount = await query(
      'SELECT COUNT(*) as count FROM user WHERE role IN (3, 4, 5)', // FACULTY, OFFICER, STAFF
      []
    )
    counts.faculty = facultyCount[0].count

    // Publications counts
    const journalCount = await query(
      'SELECT COUNT(*) as count FROM journal_papers',
      []
    )
    counts.journalPapers = journalCount[0].count

    const conferenceCount = await query(
      'SELECT COUNT(*) as count FROM conference_papers',
      []
    )
    counts.conferencePapers = conferenceCount[0].count

    // Books counts
    const textbooksCount = await query(
      'SELECT COUNT(*) as count FROM textbooks',
      []
    )
    counts.textbooks = textbooksCount[0].count

    const editedBooksCount = await query(
      'SELECT COUNT(*) as count FROM edited_books',
      []
    )
    counts.editedBooks = editedBooksCount[0].count

    const bookChaptersCount = await query(
      'SELECT COUNT(*) as count FROM book_chapters',
      []
    )
    counts.bookChapters = bookChaptersCount[0].count

    // Projects counts
    const sponsoredCount = await query(
      'SELECT COUNT(*) as count FROM sponsored_projects',
      []
    )
    counts.sponsoredProjects = sponsoredCount[0].count

    const consultancyCount = await query(
      'SELECT COUNT(*) as count FROM consultancy_projects',
      []
    )
    counts.consultancyProjects = consultancyCount[0].count

    // IPR counts
    const patentsCount = await query(
      'SELECT COUNT(*) as count FROM patents',
      []
    )
    counts.patents = patentsCount[0].count

    const iprCount = await query(
      'SELECT COUNT(*) as count FROM ipr',
      []
    )
    counts.ipr = iprCount[0].count

    // Innovation and Startups
    const startupsCount = await query(
      'SELECT COUNT(*) as count FROM startups',
      []
    )
    counts.startups = startupsCount[0].count

    const innovationCount = await query(
      'SELECT COUNT(*) as count FROM innovation',
      []
    )
    counts.innovations = innovationCount[0].count

    // Activities
    const workshopsCount = await query(
      'SELECT COUNT(*) as count FROM workshops_conferences',
      []
    )
    counts.workshopsConferences = workshopsCount[0].count

    const instituteActivitiesCount = await query(
      'SELECT COUNT(*) as count FROM institute_activities',
      []
    )
    counts.instituteActivities = instituteActivitiesCount[0].count

    const departmentActivitiesCount = await query(
      'SELECT COUNT(*) as count FROM department_activities',
      []
    )
    counts.departmentActivities = departmentActivitiesCount[0].count

    // Education and Experience
    const educationCount = await query(
      'SELECT COUNT(*) as count FROM education',
      []
    )
    counts.education = educationCount[0].count

    const workExperienceCount = await query(
      'SELECT COUNT(*) as count FROM work_experience',
      []
    )
    counts.workExperience = workExperienceCount[0].count

    // If email is provided, get counts for specific faculty
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      const facultyCounts = {}
      
      // Get all counts for specific faculty
      for (const table of [
        'journal_papers',
        'conference_papers',
        'textbooks',
        'edited_books',
        'book_chapters',
        'sponsored_projects',
        'consultancy_projects',
        'patents',
        'ipr',
        'startups',
        'workshops_conferences',
        'institute_activities',
        'department_activities',
        'education',
        'work_experience'
      ]) {
        const result = await query(
          `SELECT COUNT(*) as count FROM ${table} WHERE email = ?`,
          [email]
        )
        facultyCounts[table] = result[0].count
      }

      return NextResponse.json({
        total: counts,
        faculty: facultyCounts
      })
    }

    return NextResponse.json(counts)

  } catch (error) {
    console.error('Count API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
}