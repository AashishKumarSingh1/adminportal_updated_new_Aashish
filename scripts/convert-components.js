const fs = require('fs');
const path = require('path');

// Components that need to be converted from API calls to context usage
const componentMappings = {
  'department-activities.js': {
    contextMethod: 'getDepartmentActivities',
    dataField: 'department_activities'
  },
  'internships.js': {
    contextMethod: 'getInternships', 
    dataField: 'internships'
  },
  'phd-candidates.js': {
    contextMethod: 'getPhdCandidates',
    dataField: 'phd_candidates'
  },
  'teaching-engagement.js': {
    contextMethod: 'getTalksAndLectures',
    dataField: 'teaching_engagement'
  },
  'subject.js': {
    contextMethod: 'getTalksAndLectures',
    dataField: 'teaching_engagement'
  }
};

const profileDir = 'src/app/components/profile';

Object.entries(componentMappings).forEach(([filename, config]) => {
  const filePath = path.join(profileDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Add context import if not present
  if (!content.includes('useFacultyData')) {
    content = content.replace(
      /import { useSession } from 'next-auth\/react'/,
      `import { useSession } from 'next-auth/react'\nimport { useFacultyData } from '../../../context/FacultyDataContext'`
    );
  }
  
  // 2. Replace API fetch with context usage
  const apiCallPattern = new RegExp(`const response = await fetch\\(\`/api/faculty\\?type=\\$\\{session\\?\\.user\\?\\.email\\}\`\\)[\\s\\S]*?set\\w+\\(data\\.${config.dataField}[\\s\\S]*?\\)`, 'g');
  
  if (apiCallPattern.test(content)) {
    // Add context destructuring
    content = content.replace(
      /const \{ data: session \} = useSession\(\)/,
      `const { data: session } = useSession()\n    const { ${config.contextMethod}, loading, updateFacultySection } = useFacultyData()`
    );
    
    // Replace useEffect fetch with context data
    content = content.replace(
      /useEffect\(\(\) => \{[\s\S]*?fetchActivities\(\)[\s\S]*?\}, \[session.*?\]\)/,
      `useEffect(() => {
        const data = ${config.contextMethod}()
        setActivities(data)
    }, [${config.contextMethod}])`
    );
    
    // Remove loading state
    content = content.replace(/const \[loading, setLoading\] = useState\(true\)/, '');
    
    console.log(`✅ Fixed ${filename}`);
  } else {
    console.log(`⚠️  No API call pattern found in ${filename}`);
  }
  
  // 3. Remove window.location.reload calls
  content = content.replace(
    /window\.location\.reload\(\);?/g,
    '// Context will auto-refresh - no reload needed'
  );
  
  fs.writeFileSync(filePath, content);
});

console.log('🎉 Component conversion completed!');
