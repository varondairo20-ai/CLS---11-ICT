const fs = require('fs');
const file = process.argv[2];
const start = parseInt(process.argv[3]||1,10);
const end = parseInt(process.argv[4]||start+20,10);
if(!file){ console.error('Usage: node hexdump_lines.js <file> [start] [end]'); process.exit(2)}
const src = fs.readFileSync(file,'utf8');
const lines = src.split(/\r?\n/);
for(let i=start; i<=Math.min(end, lines.length); i++){
  const line = lines[i-1];
  const codes = [];
  for(let j=0;j<line.length;j++) codes.push(line.charCodeAt(j).toString(16).padStart(2,'0'));
  console.log((i<10?' ':'')+i+':', line);
  console.log('    hex:', codes.join(' '));
}
