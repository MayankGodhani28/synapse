const fs = require('fs');

const steps = JSON.parse(fs.readFileSync('e:/synepse/full_revert_steps.json', 'utf8'));

let html = fs.readFileSync('e:/synepse/backend/public/index.html', 'utf8');
let app = fs.readFileSync('e:/synepse/backend/public/app.js', 'utf8');

console.log('HTML has step 2666 ReplacementContent:', html.includes(steps[2666].ReplacementContent));
console.log('HTML has step 2662 ReplacementContent:', html.includes(steps[2662].ReplacementContent));

console.log('App has step 2735 ReplacementContent:', app.includes(steps[2735].ReplacementContent));
console.log('App has step 2729 ReplacementContent:', app.includes(steps[2729].ReplacementContent));
