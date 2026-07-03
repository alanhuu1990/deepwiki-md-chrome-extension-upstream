// Verify Devin wiki TOC discovery helpers against a minimal HTML fixture.
// Run: node test/repro_devin_toc.js
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const contentSrc = fs.readFileSync(path.join(__dirname, '..', 'content.js'), 'utf8');
const fixtureHtml = fs.readFileSync(path.join(__dirname, 'devin-wiki-toc.html'), 'utf8');

const fnNames = [
  'getDevinButtonLabel',
  'isDevinTocButtonSelected',
  'getDevinTocLevelFromLi',
  'getDevinWikiTocRoot',
  'getDevinWikiTocEntries',
  'getDevinSidebarButtons',
  'getDevinSidebarButtonsLegacy'
];

const exported = {};
for (const name of fnNames) {
  const re = new RegExp(`function ${name}\\s*\\([\\s\\S]*?\\n  \\}`, 'm');
  const m = contentSrc.match(re);
  if (!m) {
    console.error('Could not extract', name);
    process.exit(1);
  }
  exported[name] = m[0];
}

const dom = new JSDOM(fixtureHtml, {
  url: 'https://app.devin.ai/org/alan-hu-1/wiki/custompowerllc/battery-testing-software'
});
const { document, window } = dom.window;

const DEBUG_MODE = false;
eval(exported.getDevinButtonLabel);
eval(exported.isDevinTocButtonSelected);
eval(exported.getDevinTocLevelFromLi);
eval(exported.getDevinWikiTocRoot);
eval(exported.getDevinWikiTocEntries);
eval(exported.getDevinSidebarButtonsLegacy);
eval(exported.getDevinSidebarButtons);

const entries = getDevinWikiTocEntries();
const buttons = getDevinSidebarButtons();

console.log('TOC entries:', entries.length);
console.log('Sidebar buttons:', buttons.length);

if (entries.length !== 6) {
  console.error('Expected 6 TOC entries, got', entries.length);
  process.exit(1);
}

if (buttons.length !== 6) {
  console.error('Expected 6 sidebar buttons, got', buttons.length);
  process.exit(1);
}

const titles = entries.map(e => e.text);
const expected = [
  'Overview',
  'Architecture Patterns',
  'Agent-Based Design Pattern',
  'Testing Applications',
  'Universal Tester',
  'PUMA Test System'
];

for (let i = 0; i < expected.length; i++) {
  if (titles[i] !== expected[i]) {
    console.error(`Title mismatch at ${i}: expected "${expected[i]}", got "${titles[i]}"`);
    process.exit(1);
  }
}

const levels = entries.map(e => e.level);
if (JSON.stringify(levels) !== JSON.stringify([0, 1, 1, 0, 1, 2])) {
  console.error('Unexpected hierarchy levels:', levels);
  process.exit(1);
}

let hierarchyStack = [0];
const prefixes = entries.map((entry) => {
  const level = entry.level;
  while (hierarchyStack.length > level + 1) hierarchyStack.pop();
  while (hierarchyStack.length < level + 1) hierarchyStack.push(0);
  hierarchyStack[level]++;
  return hierarchyStack.slice(0, level + 1).join('.');
});

const expectedPrefixes = ['1', '1.1', '1.2', '2', '2.1', '2.1.1'];
if (JSON.stringify(prefixes) !== JSON.stringify(expectedPrefixes)) {
  console.error('Unexpected prefixes:', prefixes);
  process.exit(1);
}

const overviewBtn = entries[0].button;
if (!isDevinTocButtonSelected(overviewBtn)) {
  console.error('Overview button should be detected as selected');
  process.exit(1);
}

const legacy = getDevinSidebarButtonsLegacy();
if (legacy.length !== 0) {
  console.error('Legacy fallback should find no buttons in TOC fixture, got', legacy.length);
  process.exit(1);
}

console.log('Prefixes:', prefixes.join(', '));
console.log('repro_devin_toc.js: OK');
