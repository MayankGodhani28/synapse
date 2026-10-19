const fs = require('fs');

const steps = JSON.parse(fs.readFileSync('e:/synepse/full_revert_steps.json', 'utf8'));

// 1. Revert index.html
let html = fs.readFileSync('e:/synepse/backend/public/index.html', 'utf8');

if (!html.includes(steps[2666].ReplacementContent)) {
  throw new Error('index.html does not contain step 2666 ReplacementContent');
}
html = html.replace(steps[2666].ReplacementContent, steps[2666].TargetContent);

if (!html.includes(steps[2662].ReplacementContent)) {
  throw new Error('index.html does not contain step 2662 ReplacementContent');
}
html = html.replace(steps[2662].ReplacementContent, steps[2662].TargetContent);

fs.writeFileSync('e:/synepse/backend/public/index.html', html, 'utf8');
console.log('Successfully reverted backend/public/index.html');

// 2. Revert app.js
let app = fs.readFileSync('e:/synepse/backend/public/app.js', 'utf8');

if (!app.includes(steps[2735].ReplacementContent)) {
  throw new Error('app.js does not contain step 2735 ReplacementContent');
}
app = app.replace(steps[2735].ReplacementContent, steps[2735].TargetContent);

if (!app.includes(steps[2729].ReplacementContent)) {
  throw new Error('app.js does not contain step 2729 ReplacementContent');
}
app = app.replace(steps[2729].ReplacementContent, steps[2729].TargetContent);

fs.writeFileSync('e:/synepse/backend/public/app.js', app, 'utf8');
console.log('Successfully reverted backend/public/app.js');
