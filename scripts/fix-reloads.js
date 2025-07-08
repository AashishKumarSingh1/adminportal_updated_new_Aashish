const fs = require('fs');
const path = require('path');

// Find all files with window.location.reload and replace them
const profileDir = 'src/app/components/profile';
const files = fs.readdirSync(profileDir).filter(f => f.endsWith('.js'));

console.log('🔧 Removing window.location.reload() from all profile components...');

files.forEach(file => {
  const filePath = path.join(profileDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const originalContent = content;
  
  // Replace window.location.reload() with context refresh
  content = content.replace(
    /window\.location\.reload\(\);?/g, 
    '// Context will auto-refresh - no reload needed'
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${file}`);
  }
});

console.log('✅ All window.location.reload() calls removed!');
