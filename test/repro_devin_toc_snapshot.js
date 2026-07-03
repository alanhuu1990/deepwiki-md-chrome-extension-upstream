// Verify Devin wiki TOC discovery against a saved full Devin wiki HTML dump.
// Run: node test/repro_devin_toc_snapshot.js [path-to-html]
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const defaultSnapshot = path.join(
  process.env.USERPROFILE || '',
  'Downloads',
  'ml',
  'DeepWiki_ custompowerllc_GA_Modbus_Python_App.html'
);
const snapshotPath = process.argv[2] || defaultSnapshot;

if (!fs.existsSync(snapshotPath)) {
  console.log(`Snapshot not found (${snapshotPath}); skipping live HTML verification.`);
  process.exit(0);
}

const contentSrc = fs.readFileSync(path.join(__dirname, '..', 'content.js'), 'utf8');
const fixtureHtml = fs.readFileSync(snapshotPath, 'utf8');

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
  url: 'https://app.devin.ai/wiki/custompowerllc/GA_Modbus_Python_App'
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
const legacy = getDevinSidebarButtonsLegacy();

console.log('Snapshot:', snapshotPath);
console.log('TOC entries:', entries.length);
console.log('First titles:', entries.slice(0, 5).map(e => e.text).join(' | '));

if (entries.length < 30) {
  console.error('Expected at least 30 TOC entries from saved snapshot, got', entries.length);
  process.exit(1);
}

if (entries[0].text !== 'Overview') {
  console.error('First entry should be Overview, got', entries[0].text);
  process.exit(1);
}

if (buttons.length !== entries.length) {
  console.error('Button count mismatch');
  process.exit(1);
}

let hierarchyStack = [0];
const firstPrefix = (() => {
  const entry = entries[0];
  const level = entry.level;
  while (hierarchyStack.length < level + 1) hierarchyStack.push(0);
  hierarchyStack[level]++;
  return hierarchyStack.slice(0, level + 1).join('.');
})();

if (firstPrefix !== '1') {
  console.error('First prefix should be 1, got', firstPrefix);
  process.exit(1);
}

if (legacy.length > 0) {
  console.error('Legacy fallback should not activate when TOC is present, got', legacy.length);
  process.exit(1);
}

console.log('repro_devin_toc_snapshot.js: OK');
