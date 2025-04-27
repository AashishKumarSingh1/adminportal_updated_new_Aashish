import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { ROLES } from '@/lib/roles'
import { authOptions } from '@/lib/authOptions'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json(
      { message: 'You are not authorized' },
      { status: 403 }
    )
  }

  try {
    const { type, ...params } = await request.json()

    // Notice deletion (Super Admin, Academic Admin, Dept Admin)
    if (type === 'notice') {
      const canDeleteNotice = 
        session.user.role === 'SUPER_ADMIN' ||
        (session.user.role === 'DEPT_ADMIN' && params.department === session.user.department) ||
        session.user.role === 'ACADEMIC_ADMIN'
      
      if (!canDeleteNotice) {
        return NextResponse.json(
          { message: 'Not authorized to delete notices' },
          { status: 403 }
        )
      }

      const result = await query(
        `DELETE FROM notices WHERE id = ?`,
        [params.id]
      )
      return NextResponse.json(result)
    }

    // Super Admin only operations
    if (session.user.role === 'SUPER_ADMIN') {
      switch (type) {
        case 'user':
          // Delete user and all related data
          const tables = [
            'phd_candidates',
            'journal_papers',
            'conference_papers',
            'textbooks',
            'edited_books',
            'book_chapters',
            'sponsored_projects',
            'consultancy_projects',
            'teaching_engagement',
            "memberships",
            'project_supervision',
            'workshops_conferences',
            'institute_activities',
            'department_activities',
            'work_experience',
            'ipr',
            'startups',
            'internships',
            'user',
            'education'
          ]

          for (const table of tables) {
            await query(
              `DELETE FROM ${table} WHERE email = ?`,
              [params.email]
            ).catch(e => console.error(`Error deleting from ${table}:`, e))
          }

          return NextResponse.json({ message: 'User and related data deleted successfully' })

        case 'webteam':
          const webteamResult = await query(
            `DELETE FROM webteam WHERE id = ?`,
            [params.id]
          )
          return NextResponse.json(webteamResult)

        case 'event':
          const eventResult = await query(
            `DELETE FROM events WHERE id = ?`,
            [params.id]
          )
          return NextResponse.json(eventResult)

        case 'innovation':
          const innovationResult = await query(
            `DELETE FROM innovation WHERE id = ?`,
            [params.id]
          )
          return NextResponse.json(innovationResult)

        case 'news':
          const newsResult = await query(
            `DELETE FROM news WHERE id = ?`,
            [params.id]
          )
          return NextResponse.json(newsResult)
      }
    }

    // User specific deletions (email matches)
    if (session.user.email === params.email) {
      switch (type) {
        case 'phd_candidates':
          const phdResult = await query(
            `DELETE FROM phd_candidates WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(phdResult)

          case 'patents':
            const deleteResult = await query(
                `DELETE FROM patents WHERE id = ?`,
                [params.id]
            );
        
            if (deleteResult.affectedRows > 0) {
                return NextResponse.json({ message: 'Patent deleted successfully' });
            } else {
                return NextResponse.json({ message: 'Patent not found' }, { status: 404 });
            }
        

        case 'journal_papers':
          const journalResult = await query(
            `DELETE FROM journal_papers WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(journalResult)

        case 'conference_papers':
          const conferenceResult = await query(
            `DELETE FROM conference_papers WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(conferenceResult)

        case 'textbooks':
          const textbookResult = await query(
            `DELETE FROM textbooks WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(textbookResult)

        case 'edited_books':
          const editedBookResult = await query(
            `DELETE FROM edited_books WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(editedBookResult)

        case 'book_chapters':
          const chapterResult = await query(
            `DELETE FROM book_chapters WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(chapterResult)

        case 'sponsored_projects':
          const sponsoredResult = await query(
            `DELETE FROM sponsored_projects WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(sponsoredResult)

        case 'consultancy_projects':
          const consultancyResult = await query(
            `DELETE FROM consultancy_projects WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(consultancyResult)

        case 'teaching_engagement':
          const teachingResult = await query(
            `DELETE FROM teaching_engagement WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(teachingResult)

          case 'memberships':
            const deleteMembershipResult = await query(
                `DELETE FROM memberships WHERE id = ?`,
                [params.id]
            );
            return NextResponse.json(deleteMembershipResult);

        case 'project_supervision':
          const supervisionResult = await query(
            `DELETE FROM project_supervision WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(supervisionResult)

        case 'workshops_conferences':
          const workshopResult = await query(
            `DELETE FROM workshops_conferences WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(workshopResult)

        case 'institute_activities':
          const instituteResult = await query(
            `DELETE FROM institute_activities WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(instituteResult)

        case 'department_activities':
          const departmentResult = await query(
            `DELETE FROM department_activities WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(departmentResult)

        case 'work_experience':
          const workExpResult = await query(
            `DELETE FROM work_experience WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(workExpResult)

        case 'ipr':
          const iprResult = await query(
            `DELETE FROM ipr WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(iprResult)

        case 'startups':
          const startupResult = await query(
            `DELETE FROM startups WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(startupResult)

        case 'internships':
          const internshipResult = await query(
            `DELETE FROM internships WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(internshipResult)
        case 'education':
          const educationResult = await query(
            `DELETE FROM education WHERE id = ? AND email = ?`,
            [params.id, params.email]
          )
          return NextResponse.json(educationResult)

        case 'profile_image':
          const imageResult = await query(
            `UPDATE user SET image = NULL WHERE email = ?`,
            [params.email]
          )
          return NextResponse.json(imageResult)

        case 'profile_cv':
          const cvResult = await query(
            `UPDATE user SET cv = NULL WHERE email = ?`,
            [params.email]
          )
          return NextResponse.json(cvResult)
      }
    }

    return NextResponse.json(
      { message: 'Could not find matching requests' },
      { status: 400 }
    )

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
} 