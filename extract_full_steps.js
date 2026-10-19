const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/rudra/.gemini/antigravity-ide/brain/ba774b41-7ae0-45fd-baec-c7fb7821a217/.system_generated/logs/transcript_full.jsonl')
});

const steps = {};

rl.on('line', (line) => {
  const d = JSON.parse(line);
  if ([2662, 2666, 2729, 2735].includes(d.step_index)) {
    steps[d.step_index] = d.tool_calls[0].args;
  }
});

rl.on('close', () => {
  fs.writeFileSync('e:/synepse/full_revert_steps.json', JSON.stringify(steps, null, 2));
  console.log('Extracted full revert steps to e:/synepse/full_revert_steps.json');
});
