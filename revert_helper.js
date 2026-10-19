const fs = require('fs');
const steps = JSON.parse(fs.readFileSync('e:/synepse/scratch_revert.json', 'utf8'));

let html = fs.readFileSync('e:/synepse/backend/public/index.html', 'utf8').replace(/\r\n/g, '\n');
let app = fs.readFileSync('e:/synepse/backend/public/app.js', 'utf8').replace(/\r\n/g, '\n');

function clean(val) {
  let s = val;
  while (typeof s === 'string' && s.startsWith('"') && s.endsWith('"')) {
    try {
      const parsed = JSON.parse(s);
      s = parsed;
    } catch (e) {
      break;
    }
  }
  return typeof s === 'string' ? s.replace(/\r\n/g, '\n') : '';
}

for (let k of Object.keys(steps)) {
  let rep = clean(steps[k].ReplacementContent);
  let target = clean(steps[k].TargetContent);
  let fileContent = (k.startsWith('26') ? html : app);
  console.log('Step ' + k + ' rep in file: ' + fileContent.includes(rep) + ' | target in file: ' + fileContent.includes(target));
  if (!fileContent.includes(rep)) {
    console.log('Rep snippet: ' + JSON.stringify(rep.slice(0, 80)));
  }
}
