const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/pages');

function fixFiles() {
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jsx'));
  
  for (const file of files) {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // 1. Table responsive wrapper
    // If it has <table className="items-table"> but no wrapper, or a bad wrapper
    if (content.includes('<table')) {
      // Replace <div className="items-table-wrapper">
      if (content.includes('className="items-table-wrapper"')) {
        content = content.replace(/className="items-table-wrapper"/g, 'className="table-responsive"');
        changed = true;
      }
      
      // If table is inside some other non-responsive div, let's just make a generic replace.
      // But let's be careful. Let's just find <table and ensure it's wrapped.
      // Easiest is to replace <table with <div className="table-responsive">\n<table
      // and </table> with </table>\n</div>
      // Actually, if it's already wrapped in table-responsive, don't do it again.
      // A better way is to do it manually for the files I know.
    }
    
    // 2. Fix missing keys in Analytics
    if (file === 'Analytics.jsx') {
      content = content.replace(/<div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>/g, 
      '<div key={month} style={{ flex: 1, display: \'flex\', flexDirection: \'column\', alignItems: \'center\', gap: \'0.25rem\' }}>');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    }
  }
}

fixFiles();
