// Verify Devin org-wiki link-based TOC discovery against saved battery-testing HTML.
// Run: node test/repro_devin_org_wiki_snapshot.js [path-to-html]
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const defaultSnapshot = path.join(
  process.env.USERPROFILE || '',
  'Downloads',
  'Wiki — custompowerllc_battery-testing-software.htm'
);
const snapshotPath = process.argv[2] || defaultSnapshot;

if (!fs.existsSync(snapshotPath)) {
  console.log(`Snapshot not found (${snapshotPath}); skipping org-wiki HTML verification.`);
  process.exit(0);
}

const contentSrc = fs.readFileSync(path.join(__dirname, '..', 'content.js'), 'utf8');

const fnNames = [
  'getDevinOrgWikiBasePath',
  'getDevinOrgWikiSidebarRoot',
  'getDevinOrgWikiPageIdFromHref',
  'getDevinOrgWikiLinkLabel',
  'isDevinOrgWikiLinkSelected',
  'getDevinOrgWikiTocEntries',
  'getDevinWikiTocRoot',
  'getDevinWikiTocEntries'
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

const fixtureHtml = fs.readFileSync(snapshotPath, 'utf8');
const dom = new JSDOM(fixtureHtml, {
  url: 'https://app.devin.ai/org/alan-hu-1/wiki/custompowerllc/battery-testing-software?branch=main'
});
const { document, window } = dom.window;

eval(exported.getDevinOrgWikiBasePath);
eval(exported.getDevinOrgWikiSidebarRoot);
eval(exported.getDevinOrgWikiPageIdFromHref);
eval(exported.getDevinOrgWikiLinkLabel);
eval(exported.isDevinOrgWikiLinkSelected);
eval(exported.getDevinOrgWikiTocEntries);
eval(exported.getDevinWikiTocRoot);
eval(exported.getDevinWikiTocEntries);

const orgEntries = getDevinOrgWikiTocEntries();
const legacyEntries = getDevinWikiTocEntries();

console.log('Snapshot:', snapshotPath);
console.log('Org wiki entries:', orgEntries.length);
console.log('Legacy button entries:', legacyEntries.length);
console.log('First titles:', orgEntries.slice(0, 5).map(e => `${e.prefix} ${e.text}`).join(' | '));
console.log('Last title:', orgEntries.length ? `${orgEntries.at(-1).prefix} ${orgEntries.at(-1).text}` : 'n/a');

if (orgEntries.length < 30) {
  console.error('Expected at least 30 org-wiki entries, got', orgEntries.length);
  process.exit(1);
}

if (orgEntries[0].text !== 'Overview' || orgEntries[0].prefix !== '1') {
  console.error('First entry should be "1 Overview", got', orgEntries[0].prefix, orgEntries[0].text);
  process.exit(1);
}

if (orgEntries[0].href.indexOf('/page/1?') === -1) {
  console.error('First entry should use real /page/ URL, got', orgEntries[0].href);
  process.exit(1);
}

if (!orgEntries[0].selected) {
  console.error('Overview should be marked selected');
  process.exit(1);
}

if (legacyEntries.length > 0) {
  console.error('Legacy button TOC should not activate on org-wiki HTML, got', legacyEntries.length);
  process.exit(1);
}

const nested = orgEntries.find(e => e.prefix === '3.1.1');
if (!nested || nested.text !== 'Board Level Test (MTI-105052-05)') {
  console.error('Missing nested page 3.1.1');
  process.exit(1);
}

console.log('repro_devin_org_wiki_snapshot.js: OK');
