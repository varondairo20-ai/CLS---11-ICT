const fs = require('fs');
const path = process.argv[2];
if(!path){ console.error('Usage: node scan_scripts.js <file>'); process.exit(2)}
const src = fs.readFileSync(path,'utf8');
const scriptRe = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let m; let i=0; let ok=true;
while((m=scriptRe.exec(src))){
  i++;
  const content = m[1];
  try{
    // Try parsing by creating a function wrapper
    new Function(content);
    console.log(`#${i}: OK`);
  }catch(err){
    console.error(`#${i}: PARSE ERROR ->`, err.message);
    // print snippet around error position if available
    if(err && err.loc){
      console.error('Loc:', err.loc);
    }
    const lines = content.split(/\n/);
    const max = Math.min(lines.length, 300);
    console.error('--- Script content preview ---');
    for(let li=0; li<max; li++){
      const n = li+1;
      console.error((n<10? ' ':'')+n+': '+lines[li]);
    }
    ok=false;
  }
}
if(i===0) console.warn('No <script> blocks found');
process.exit(ok?0:1);
