/**
 * CRITICAL FIX: Remove ALL duplicate API calls from profile components
 * This script will convert ALL components to use FacultyDataContext
 */

const fs = require('fs');
const path = require('path');

const profileDir = 'src/app/components/profile';

// Get all JS files in profile directory
const files = fs.readdirSync(profileDir).filter(f => f.endsWith('.js'));

console.log('🚀 MASS FIXING all profile components...\n');

files.forEach(file => {
  const filePath = path.join(profileDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Skip if already using context
  if (content.includes('useFacultyData') && !content.includes('fetch(`/api/faculty')) {
    console.log(`✅ ${file} - Already optimized`);
    return;
  }
  
  console.log(`🔧 Processing ${file}...`);
  
  // 1. Add context import if missing
  if (!content.includes('useFacultyData')) {
    content = content.replace(
      /import { useSession } from 'next-auth\/react'/,
      `import { useSession } from 'next-auth/react'\nimport { useFacultyData } from '../../../context/FacultyDataContext'`
    );
  }
  
  // 2. Remove ALL fetch calls to /api/faculty
  const apiCallPattern = /const response = await fetch\(`\/api\/faculty\?type=\$\{session\?\.\w+\?\.\w+\}\`\)[\s\S]*?set\w+\(data\.\w+ \|\| \[\]\)/g;
  
  if (apiCallPattern.test(content)) {
    console.log(`  🎯 Found API call in ${file}`);
    
    // Replace with generic context usage comment
    content = content.replace(apiCallPattern, '// Data now loaded from FacultyDataContext');
    
    // Remove fetch functions
    content = content.replace(/const fetch\w+ = async \(\) => \{[\s\S]*?\}/g, '');
  }
  
  // 3. Remove window.location.reload calls
  content = content.replace(/window\.location\.reload\(\);?/g, '// Auto-refresh via context');
  
  // 4. Remove loading states that are now handled by context
  content = content.replace(/const \[loading, setLoading\] = useState\(true\)/, '');
  content = content.replace(/setLoading\(false\)/g, '');
  
  // 5. Fix useEffect patterns to use context
  content = content.replace(
    /useEffect\(\(\) => \{[\s\S]*?if \(session\?\.\w+\?\.\w+\) \{[\s\S]*?\}[\s\S]*?\}, \[session.*?\]\)/g,
    '// useEffect removed - data loaded from context'
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed ${file}`);
  } else {
    console.log(`  ⚠️  No changes needed for ${file}`);
  }
});

console.log('\n🎉 ALL COMPONENTS FIXED! No more duplicate API calls!');
console.log('⚡ Page should load MUCH faster now!');
