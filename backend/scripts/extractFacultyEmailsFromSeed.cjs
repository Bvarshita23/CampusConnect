const fs = require('fs');
const vm = require('vm');
const path = require('path');

const seedPath = path.join(__dirname, 'seedBITMFaculty.js');
const content = fs.readFileSync(seedPath, 'utf8');

const marker = 'const facultyData = [';
const start = content.indexOf(marker);
if (start === -1) {
  console.error('facultyData marker not found');
  process.exit(1);
}

let i = start + marker.length - 1; // position at the opening [
let depth = 0;
let end = -1;
for (; i < content.length; i++) {
  const ch = content[i];
  if (ch === '[') depth++;
  else if (ch === ']') {
    depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}

if (end === -1) {
  console.error('Could not locate end of facultyData array');
  process.exit(1);
}

const arrayText = content.slice(start + 'const facultyData = '.length, end + 1);

// Evaluate the array in a safe VM
let facultyData;
try {
  facultyData = vm.runInNewContext('(' + arrayText + ')');
} catch (err) {
  console.error('Error evaluating faculty array:', err.message);
  process.exit(1);
}

const generateEmail = (name) => {
  let cleanName = name
    .toLowerCase()
    .replace(/dr\.?\s*/g, '')
    .replace(/mr\.?\s*/g, '')
    .replace(/mrs\.?\s*/g, '')
    .replace(/ms\.?\s*/g, '')
    .replace(/professor\s*/g, '')
    .replace(/\./g, ' ')
    .replace(/\s+/g, '.')
    .replace(/[^a-z.]/g, '')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');

  if (cleanName.length === 0) cleanName = 'faculty';
  return `${cleanName}@bitm.edu.in`;
};

const emails = facultyData.map((f) => ({ name: f.name, department: f.department || 'Unknown', email: generateEmail(f.name) }));

// Print one email per line
emails.forEach((e) => console.log(e.email));

// Also print a small summary
console.error(`\nTotal: ${emails.length} emails (printed to stdout)`);
