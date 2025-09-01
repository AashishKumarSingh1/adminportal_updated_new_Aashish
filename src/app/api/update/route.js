import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function PUT(request) {
  try {
    // Use original authentication for now
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { type, ...params } = await request.json()

    // Handle profile updates
    if (type === 'profile') {
      // Check permissions
      if (session.user.email !== params.email && session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { message: 'Not authorized' },
          { status: 403 }
        )
      }

      let queryParts = []
      let updateValues = []

      // Handle all possible profile fields
      const fields = [
          'image',
          'cv',
          'name',
          'designation',
          'research_interest',
          'academic_responsibility',
          'ext_no',
          'linkedin',
          'google_scholar',
          'personal_webpage',
          'scopus',
          'vidwan',
          'orcid'
      ]

      fields.forEach(field => {
          if (params[field] !== undefined) {
              queryParts.push(`${field} = ?`)
              updateValues.push(params[field])
          }
      })

      // Add email as the last parameter
      updateValues.push(params.email)

      const result = await query(
          `UPDATE user SET ${queryParts.join(', ')} WHERE email = ?`,
          updateValues
      )

      return NextResponse.json(result)
    }

    // Notice updates - Super Admin, Academic Admin, and Department Admin access
    if (type === 'notice') {
      // First, get the notice details to check authorization
      const notice = await query(
        `SELECT notice_type, department FROM notices WHERE id = ?`,
        [params.data.id]
      );

      if (!notice || notice.length === 0) {
        return NextResponse.json(
          { message: 'Notice not found' },
          { status: 404 }
        )
      }

      const noticeData = notice[0];
      
      console.log('DEBUG: Notice update authorization check')
      console.log('User role:', session.user.role)
      console.log('User department:', session.user.department)
      console.log('Notice department:', noticeData.department)
      console.log('Notice type:', noticeData.notice_type)

      const canUpdateNotice = 
        session.user.role === 'SUPER_ADMIN' ||
        (session.user.role === 'ACADEMIC_ADMIN' && noticeData.notice_type === 'academics') ||
        (session.user.role === 'DEPT_ADMIN' && 
         noticeData.notice_type === 'department' && 
         noticeData.department === session.user.department)
      
      console.log('Can update notice:', canUpdateNotice)
      
      if (!canUpdateNotice) {
        return NextResponse.json(
          { message: 'Not authorized to update notices' },
          { status: 403 }
        )
      }

      // Log any attachments for debugging
      if (params.data.attachments) {
        console.log(`Notice update ID ${params.data.id}: Attachments:`, 
          typeof params.data.attachments === 'string' 
            ? params.data.attachments 
            : JSON.stringify(params.data.attachments));
      }
        
      const result = await query(
        `UPDATE notices SET 
            title = ?,
            updatedAt = ?,
            openDate = ?,
            closeDate = ?,
            important = ?,
            attachments = ?,
            notice_link = ?,
            isVisible = ?,
            updatedBy = ?,
            notice_type = ?,
            department = ?
        WHERE id = ?`,
        [
            params.data.title,
            new Date().getTime(),
            params.data.openDate,
            params.data.closeDate,
            params.data.important || 0,
            JSON.stringify(params.data.attachments),
            params.data.notice_link || null,
            params.data.isVisible === undefined ? 1 : Number(params.data.isVisible),
            session.user.email,
            params.data.notice_type || null,
            params.data.department || null,
            params.data.id
        ]
      )      
      return NextResponse.json(result)
    }

    // Super Admin only access
    if (session.user.role === 'SUPER_ADMIN') {
      switch (type) {
        case 'event':
          const eventResult = await query(
            `UPDATE events SET 
             title = ?,
             updatedAt = ?,
             openDate = ?,
             closeDate = ?,
             venue = ?,
             doclink = ?,
             attachments = ?,
             event_link = ?,
             eventStartDate = ?,
             eventEndDate = ?,
             updatedBy = ?,
             type = ?
             WHERE id = ?`,
            [
              params.data.title,
              new Date().getTime(),
              params.data.openDate,
              params.data.closeDate,
              params.data.venue,
              params.data.doclink,
              JSON.stringify(params.data.attachments || []),
              JSON.stringify(params.data.event_link),
              params.data.eventStartDate,
              params.data.eventEndDate,
              params.data.updatedBy || session.user.email,
              params.data.type || 'general',
              params.data.id
            ]
          )
          return NextResponse.json(eventResult)

        case 'patents':
          const patentResult = await query(
              `UPDATE patents
              SET title = ?, description = ?, patent_date = ?, email = ?
              WHERE id = ?`,
              [
                  params.title,
                  params.description,
                  params.patent_date,
                  params.email,
                  params.id 
              ]
          );
          return NextResponse.json(patentResult);

        case 'innovation':
          const innovationResult = await query(
            `UPDATE innovation SET 
             title = ?,
             updatedAt = ?,
             openDate = ?,
             closeDate = ?,
             description = ?,
             image = ?,
             author = ?,
             updatedBy = ?
             WHERE id = ?`,
            [
              params.data.title,
              new Date().getTime(),
              params.data.openDate,
              params.data.closeDate,
              params.data.description,
              JSON.stringify(params.data.image),
              params.data.author,
              params.data.email,
              params.data.id
            ]
          )
          return NextResponse.json(innovationResult)

        case 'news':
          const newsResult = await query(
            `UPDATE news SET 
             title = ?,
             updatedAt = ?,
             openDate = ?,
             closeDate = ?,
             image = ?,
             description = ?,
             attachments = ?,
             author = ?,
             updatedBy = ?
             WHERE id = ?`,
            [
              params.data.title,
              new Date().getTime(),
              params.data.openDate,
              params.data.closeDate,
              JSON.stringify(params.data.image),
              params.data.description,
              JSON.stringify(params.data.add_attach),
              params.data.author,
              params.data.email,
              params.data.id
            ]
          )
          return NextResponse.json(newsResult)

        case 'user':
          if (params.update_social_media_links) {
            const socialResult = await query(
              `UPDATE user SET 
               linkedin = ?,
               google_scholar = ?,
               personal_webpage = ?,
               scopus = ?,
               vidwan = ?,
               orcid = ?
               WHERE email = ?`,
              [
                params.Linkedin || '',
                params['Google Scholar'] || '',
                params['Personal Webpage'] || '',
                params['Scopus'] || '',
                params['Vidwan'] || '',
                params['Orcid'] || '',
                session.user.email
              ]
            )
            return NextResponse.json(socialResult)
          } else {
            const {
              email,
              name,
              department,
              designation,
              role,
              ext_no,
              research_interest,
              academic_responsibility,
              is_retired,
              retirement_date
            } = params

            // Format retirement_date for MySQL or set to NULL
            const formattedRetirementDate = retirement_date ? new Date(retirement_date).toISOString().slice(0, 10) : null

            const facultyResult = await query(
              `UPDATE user SET 
                name = ?,
                department = ?,
                designation = ?,
                role = ?,
                ext_no = ?,
                research_interest = ?,
                academic_responsibility = ?,
                is_retired = ?,
                retirement_date = ?
              WHERE email = ?`,
              [
                name,
                department,
                designation,
                role,
                ext_no,
                research_interest,
                academic_responsibility || null,
                is_retired,
                formattedRetirementDate,
                email
              ]
            )
            return NextResponse.json(facultyResult)
          }
      }
    }

    // User specific updates (email matches)
    if (session.user.email === params.email) {
      switch (type) {
        // Academic Records
        case 'phd_candidates':
          const phdResult = await query(
            `UPDATE phd_candidates SET 
              student_name = ?,
              roll_no = ?,
              registration_year = ?,
              registration_type = ?,
              research_area = ?,
              other_supervisors = ?,
              current_status = ?,
              completion_year = ?,
              supervisor_type = ? ,
              registration_date = ?
            WHERE id = ? AND email = ?`,
            [
              params.student_name,
              params.roll_no,
              new Date(params.registration_date).getFullYear(),
              params.registration_type,
              params.research_area,
              params.other_supervisors,
              params.current_status,
              params.completion_year,
              params.supervisor_type,
              params.registration_date,
              params.id,
              params.email
            ]
          ); 
          return NextResponse.json(phdResult)

        case 'journal_papers':
          const journalResult = await query(
            `UPDATE journal_papers SET 
             authors = ?,
             title = ?,
             journal_name = ?,
             volume = ?,
             publication_year = ?,
             pages = ?,
             journal_quartile = ?,
             publication_date = ?,
             student_involved = ?,
             student_details = ?,
             doi_url = ?,
             indexing = ? , 
             foreign_author_details = ? , 
             nationality_type = ?
             WHERE id = ? AND email = ?`,
            [
              params.authors,
              params.title,
              params.journal_name,
              params.volume,
              params.publication_year,
              params.pages,
              params.journal_quartile,
              params.publication_date,
              params.student_involved,
              params.student_details,
              params.doi_url,
              params.indexing,
              params.foreign_author_details,
              params.nationality_type,
              params.id,
              params.email
            ]
          )
          return NextResponse.json(journalResult)

        case 'conference_papers':
          const conferenceResult = await query(
            `UPDATE conference_papers SET 
              authors = ?,
              title = ?,
              conference_name = ?,
              location = ?,
              conference_year = ?,
              conference_type = ?,
              student_name = ?,
              student_roll_no = ?,
              foreign_author_name = ?,
              foreign_author_country_name = ?,
              foreign_author_institute_name = ?,
              pages = ?,
              indexing = ?,
              foreign_author = ?,
              student_involved = ?,
              doi = ?
            WHERE id = ? AND email = ?`,
            [
              params.authors,
              params.title,
              params.conference_name,
              params.location,
              params.conference_year,
              params.conference_type,
              params.student_name,
              params.student_roll_no,
              params.foreign_author_name,
              params.foreign_author_country_name,
              params.foreign_author_institute_name,
              params.pages,
              params.indexing,
              params.foreign_author_name ? "yes" : "no",
              params.student_name ? "yes" : "no",
              params.doi,
              params.id,
              params.email
            ]
          )
          return NextResponse.json(conferenceResult)


        // Books
        case 'textbooks':
          const textbookResult = await query(
            `UPDATE textbooks SET 
             title = ?,
             authors = ?,
             publisher = ?,
             isbn = ?,
             year = ?,
             scopus = ?,
             doi = ?
             WHERE id = ? AND email = ?`,
            [
              params.title,
              params.authors,
              params.publisher,
              params.isbn,
              params.year,
              params.scopus,
              params.doi,
              params.id,
              params.email
            ]
          )
          return NextResponse.json(textbookResult)

        case 'edited_books':
          const editedBookResult = await query(
            `UPDATE edited_books SET 
             title = ?,
             editors = ?,
             publisher = ?,
             isbn = ?,
             year = ?,
             scopus = ?,
             doi = ?
             WHERE id = ? AND email = ?`,
            [
              params.title,
              params.editors,
              params.publisher,
              params.isbn,
              params.year,
              params.scopus,
              params.doi,
              params.id,
              params.email
            ]
          )
          return NextResponse.json(editedBookResult)

        case 'book_chapters':
          const chapterResult = await query(
            `UPDATE book_chapters SET 
             authors = ?,
             chapter_title = ?,
             book_title = ?,
             pages = ?,
             publisher = ?,
             isbn = ?,
             year = ?,
             scopus = ?,
             doi = ?
             WHERE id = ? AND email = ?`,
            [
              params.authors,
              params.chapter_title,
              params.book_title,
              params.pages,
              params.publisher,
              params.isbn,
              params.year,
              params.scopus,
              params.doi,
              params.id,
              params.email
            ]
          )
          return NextResponse.json(chapterResult)

        // Projects
        case 'sponsored_projects':
          const sponsoredResult = await query(
            `UPDATE sponsored_projects SET 
             project_title = ?,
             role=?,
             funding_agency = ?,
             financial_outlay = ?,
             start_date = ?,
             end_date = ?,
             investigators = ?,
             pi_institute = ?,
             status = ?,
             funds_received = ?
             WHERE id = ? AND email = ?`,
            [
              params.project_title,
              params.role,
              params.funding_agency,
              params.financial_outlay,
              params.start_date,
              params.end_date,
              params.investigators,
              params.pi_institute,
              params.status,
              params.funds_received,
              params.id,
              params.email
            ]
          )
          return NextResponse.json(sponsoredResult)

        case 'consultancy_projects':
          const consultancyResult = await query(
            `UPDATE consultancy_projects SET 
             project_title = ?,
             role= ?,
             funding_agency = ?,
             financial_outlay = ?,
             start_date = ?,
             period_months = ?,
             investigators = ?,
             status = ?
             WHERE id = ? AND email = ?`,
            [
              params.project_title,
              params.role,
              params.funding_agency,
              params.financial_outlay,
              params.start_date,
              params.period_months,
              params.investigators,
              params.status,
              params.id,
              params.email
            ]
          )
          return NextResponse.json(consultancyResult)

        // IPR and Startups
        case 'ipr':
          const iprResult = await query(
            `UPDATE ipr SET 
             title = ?,
             type = ?,
             registration_date = ?,
             publication_date = ?,
             grant_date = ?,
             grant_no = ?,
             applicant_name = ?,
             inventors = ?
             WHERE id = ? AND email = ?`,
            [
              params.title,
              params.iprtype,
              params.registration_date,
              params.publication_date,
              params.grant_date,
              params.grant_no,
              params.applicant_name,
              params.inventors,
              params.id,
              params.email
            ]
          )
          return NextResponse.json(iprResult)

        case 'startups':
          const startupResult = await query(
            `UPDATE startups SET 
             startup_name = ?,
             incubation_place = ?,
             registration_date = ?,
             owners_founders = ?,
             annual_income = ?,
             pan_number = ?
             WHERE id = ? AND email = ?`,
            [
              params.startup_name,
              params.incubation_place,
              params.registration_date,
              params.owners_founders,
              params.annual_income,
              params.pan_number,
              params.id,
              params.email
            ]
          )
          return NextResponse.json(startupResult)

        // Teaching and Activities
        case 'teaching_engagement':
          const teachingResult = await query(
            `UPDATE teaching_engagement SET 
             semester = ?,
             level = ?,
             course_number = ?,
             course_title = ?,
             course_type = ?,
             student_count = ?,
             lectures = ?,
             tutorials = ?,
             practicals = ?,
             total_theory = ?,
             lab_hours = ?,
             years_offered = ?
             WHERE id = ? AND email = ?`,
            [
              params.semester,
              params.level,
              params.course_number,
              params.course_title,
              params.course_type,
              params.student_count,
              params.lectures,
              params.tutorials,
              params.practicals,
              params.total_theory,
              params.lab_hours,
              params.years_offered,
              params.id,
              params.email
            ]
          )
          return NextResponse.json(teachingResult)

        case 'memberships':
          const membershipUpdateResult = await query(
              `UPDATE memberships 
              SET email = ?, 
                  membership_id = ?, 
                  membership_society = ?, 
                  start = ?, 
                  end = ? 
              WHERE id = ?`,
              [
                  params.email,
                  params.membership_id,
                  params.membership_society,
                  params.start,
                  params.end,
                  params.id
              ]
          );
          return NextResponse.json(membershipUpdateResult);

        case 'project_supervision':
          const supervisionResult = await query(
              `UPDATE project_supervision SET 
                  category = ?, 
                  project_title = ?, 
                  student_details = ?, 
                  internal_supervisors = ?, 
                  external_supervisors = ?, 
                  start_date = ?, 
                  end_date = ?
               WHERE id = ? AND email = ?`,
              [
                  params.category,
                  params.project_title,
                  params.student_details,
                  params.internal_supervisors,
                  params.external_supervisors,
                  params.start_date,
                  params.end_date, 
                  params.id,
                  params.email
              ]
          );
          return NextResponse.json(supervisionResult);

        case 'workshops_conferences':
          const workshopResult = await query(
            `UPDATE workshops_conferences SET 
             event_type = ?,
             role = ?,
             event_name = ?,
             sponsored_by = ?,
             start_date = ?,
             end_date = ?,
             participants_count = ?
             WHERE id = ? AND email = ?`,
            [
              params.event_type,
              params.role,
              params.event_name,
              params.sponsored_by,
              params.start_date,
              params.end_date,
              params.participants_count,
              params.id,
              params.email
            ]
          )
          return NextResponse.json(workshopResult)

        case 'institute_activities':
          const instituteResult = await query(
            `UPDATE institute_activities SET 
             role_position = ?,
             institute_name = ?,
             start_date = ?,
             end_date = ?
             WHERE id = ? AND email = ?`,
            [
              params.role_position,
              params.institute_name,
              params.start_date,
              params.end_date,
              params.id,
              params.email
            ]
          )
          return NextResponse.json(instituteResult)

        case 'department_activities':
          const departmentResult = await query(
            `UPDATE department_activities SET 
             activity_description = ?,
             institute_name = ?,
             start_date = ?,
             end_date = ?
             WHERE id = ? AND email = ?`,
            [
              params.activity_description,
              params.institute_name,
              params.start_date,
              params.end_date,
              params.id,
              params.email
            ]
          )
          return NextResponse.json(departmentResult)

        case 'internships':
          const internshipResult = await query(
            `UPDATE internships SET 
             student_name = ?,
             qualification = ?,
             affiliation = ?,
             project_title = ?,
             start_date = ?,
             end_date = ?,
             student_type = ?
             WHERE id = ? AND email = ?`,
            [
              params.student_name,
              params.qualification,
              params.affiliation,
              params.project_title,
              params.start_date,
              params.end_date,
              params.student_type,
              params.id,
              params.email
            ]
          )
          return NextResponse.json(internshipResult)

        case 'education':
          const educationResult = await query(
            `UPDATE education SET 
             certification = ?,
             institution = ?,
             passing_year = ?,
             specialization=?
             WHERE id = ? AND email = ?`,
            [params.certification, params.institution, params.passing_year,params.specialization, params.id, params.email]
          )
          return NextResponse.json(educationResult)
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
