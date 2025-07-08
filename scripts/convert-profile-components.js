/**
 * Script to convert all profile components to use FacultyDataContext
 * This eliminates duplicate API calls and improves performance
 */

const fs = require('fs')
const path = require('path')

const profileComponentsDir = 'src/app/components/profile'

const sectionMappings = {
  'education.js': 'education',
  'journal-papers.js': 'journalPapers', 
  'conference-papers.js': 'conferencePapers',
  'book-chapters.js': 'bookChapters',
  'edited-books.js': 'editedBooks',
  'patents.js': 'patents',
  'projects.js': 'projects',
  'sponsored-projects.js': 'sponsoredProjects',
  'consultancy-projects.js': 'consultancyProjects',
  'project-supervision.js': 'projectSupervision',
  'phd-candidates.js': 'phdCandidates',
  'internships.js': 'internships',
  'memberships.js': 'memberships',
  'ipr.js': 'ipr',
  'department-activities.js': 'departmentActivities',
  'institute-activities.js': 'instituteActivities',
  'conferenceSession.js': 'conferenceSessionChairs',
  'journalReviewerPage.js': 'journalReviewers'
}

// Read all files in profile directory
const profileFiles = fs.readdirSync(profileComponentsDir)

console.log('Converting profile components to use FacultyDataContext...')

profileFiles.forEach(filename => {
  if (!filename.endsWith('.js') || !sectionMappings[filename]) {
    return
  }
  
  const filePath = path.join(profileComponentsDir, filename)
  const sectionName = sectionMappings[filename]
  
  console.log(`Converting ${filename} to use context section: ${sectionName}`)
  
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Add context import
    if (!content.includes('useFacultyData')) {
      content = content.replace(
        /import { useSession } from 'next-auth\/react'/,
        `import { useSession } from 'next-auth/react'
import { useFacultyData } from '../../../context/FacultyDataContext'`
      )
    }
    
    // Replace fetch API call pattern
    const fetchPattern = /const res = await fetch\(`\/api\/faculty\?type=\$\{session\?\.\w+\?\.\w+\}\`\)[\s\S]*?setEducations?\(data\.\w+ \|\| \[\]\)/g
    
    if (fetchPattern.test(content)) {
      // Add context usage
      content = content.replace(
        /const \{ data: session \} = useSession\(\)/,
        `const { data: session } = useSession()
    const { get${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}, loading, updateFacultySection } = useFacultyData()`
      )
      
      // Replace useEffect fetch with context data
      content = content.replace(
        /useEffect\(\(\) => \{[\s\S]*?\}, \[session\]\)/,
        `useEffect(() => {
        const data = get${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}()
        setData(data)
    }, [get${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}])`
      )
      
      // Remove loading state
      content = content.replace(/const \[loading, setLoading\] = useState\(true\)/, '')
      
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`✅ Successfully converted ${filename}`)
    } else {
      console.log(`⚠️  No fetch pattern found in ${filename}`)
    }
    
  } catch (error) {
    console.error(`❌ Error converting ${filename}:`, error.message)
  }
})

console.log('Profile component conversion completed!')
