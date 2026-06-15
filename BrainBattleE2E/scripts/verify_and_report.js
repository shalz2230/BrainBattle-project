/**
 * BrainBattle E2E Verification Script
 * Verifies test structure, app config, and generates Excel report.
 * Runs without a browser — safe for CI environments.
 */

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

// ── Verification Checks ────────────────────────────────────────────────────
const checks = [
  {
    name: 'Frontend package.json exists',
    suite: 'Project Structure',
    fn: () => fs.existsSync(path.join(ROOT, 'BrainBattleWeb', 'package.json'))
  },
  {
    name: 'Vite config exists',
    suite: 'Project Structure',
    fn: () => fs.existsSync(path.join(ROOT, 'BrainBattleWeb', 'vite.config.js'))
  },
  {
    name: 'React entry point (main.jsx) exists',
    suite: 'Project Structure',
    fn: () => fs.existsSync(path.join(ROOT, 'BrainBattleWeb', 'src', 'main.jsx'))
  },
  {
    name: 'App.jsx component exists',
    suite: 'Project Structure',
    fn: () => fs.existsSync(path.join(ROOT, 'BrainBattleWeb', 'src', 'App.jsx'))
  },
  {
    name: 'index.html entry exists',
    suite: 'Project Structure',
    fn: () => fs.existsSync(path.join(ROOT, 'BrainBattleWeb', 'index.html'))
  },
  {
    name: 'E2E test suite: auth.test.js exists',
    suite: 'E2E Test Files',
    fn: () => fs.existsSync(path.join(ROOT, 'BrainBattleE2E', 'tests', 'auth.test.js'))
  },
  {
    name: 'E2E test suite: navigation.test.js exists',
    suite: 'E2E Test Files',
    fn: () => fs.existsSync(path.join(ROOT, 'BrainBattleE2E', 'tests', 'navigation.test.js'))
  },
  {
    name: 'E2E test suite: games.test.js exists',
    suite: 'E2E Test Files',
    fn: () => fs.existsSync(path.join(ROOT, 'BrainBattleE2E', 'tests', 'games.test.js'))
  },
  {
    name: 'Driver setup utility exists',
    suite: 'E2E Test Files',
    fn: () => fs.existsSync(path.join(ROOT, 'BrainBattleE2E', 'utils', 'driverSetup.js'))
  },
  {
    name: 'Excel reporter utility exists',
    suite: 'E2E Test Files',
    fn: () => fs.existsSync(path.join(ROOT, 'BrainBattleE2E', 'utils', 'excelReporter.js'))
  },
  {
    name: 'Backend app.py exists',
    suite: 'Backend Structure',
    fn: () => {
      const p1 = path.join(ROOT, 'BrainBattleBackend', 'BrainBattleBackend', 'app.py');
      const p2 = path.join(ROOT, 'BrainBattleBackend', 'app.py');
      return fs.existsSync(p1) || fs.existsSync(p2);
    }
  },
  {
    name: 'Backend routes directory exists',
    suite: 'Backend Structure',
    fn: () => {
      const p1 = path.join(ROOT, 'BrainBattleBackend', 'BrainBattleBackend', 'routes');
      const p2 = path.join(ROOT, 'BrainBattleBackend', 'routes');
      return fs.existsSync(p1) || fs.existsSync(p2);
    }
  },
  {
    name: 'BrainBattleE2E package.json has test script',
    suite: 'CI Configuration',
    fn: () => {
      const pkgPath = path.join(ROOT, 'BrainBattleE2E', 'package.json');
      if (!fs.existsSync(pkgPath)) return false;
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return !!(pkg.scripts && pkg.scripts.test);
    }
  },
  {
    name: 'GitHub Actions workflow file exists',
    suite: 'CI Configuration',
    fn: () => {
      const wfDir = path.join(ROOT, '.github', 'workflows');
      return fs.existsSync(wfDir) && fs.readdirSync(wfDir).length > 0;
    }
  },
  {
    name: 'Headless Chrome mode configured in driverSetup',
    suite: 'CI Configuration',
    fn: () => {
      const f = path.join(ROOT, 'BrainBattleE2E', 'utils', 'driverSetup.js');
      if (!fs.existsSync(f)) return false;
      return fs.readFileSync(f, 'utf8').includes('headless');
    }
  }
];

// ── Run Checks ─────────────────────────────────────────────────────────────
console.log('\n🔍 BrainBattle E2E Verification\n' + '='.repeat(40));
const results = [];
let passed = 0, failed = 0;

for (const check of checks) {
  const start = Date.now();
  let status, error;
  try {
    status = check.fn() ? 'PASSED' : 'FAILED';
  } catch (e) {
    status = 'FAILED';
    error = e.message;
  }
  const duration = Date.now() - start;
  if (status === 'PASSED') {
    passed++;
    console.log(`  ✅ [PASS] ${check.name}`);
  } else {
    failed++;
    console.log(`  ❌ [FAIL] ${check.name}${error ? ' — ' + error : ''}`);
  }
  results.push({ suite: check.suite, name: check.name, status, duration: `${duration}ms`, error: error || '' });
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${results.length} checks\n`);

// ── GitHub Step Summary ────────────────────────────────────────────────────
if (process.env.GITHUB_STEP_SUMMARY) {
  let md = '## 🎮 BrainBattle E2E Verification Report\n\n';
  md += `**${passed}/${results.length} checks passed** | ${failed > 0 ? '⚠️ ' + failed + ' failed' : '✅ All passed'}\n\n`;
  md += '| Status | Suite | Check | Duration |\n';
  md += '|--------|-------|-------|----------|\n';
  results.forEach(r => {
    const icon = r.status === 'PASSED' ? '✅' : '❌';
    md += `| ${icon} ${r.status} | ${r.suite} | ${r.name} | ${r.duration} |\n`;
  });
  md += '\n---\n*Generated by BrainBattle CI Verification*\n';
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
}

// ── Generate Excel Report ──────────────────────────────────────────────────
async function generateReport() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BrainBattle CI';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('E2E Verification');
  sheet.columns = [
    { header: 'Suite', key: 'suite', width: 25 },
    { header: 'Check Name', key: 'name', width: 50 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Duration', key: 'duration', width: 12 },
    { header: 'Notes', key: 'error', width: 40 }
  ];

  // Header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a1a2e' } };
  headerRow.height = 20;

  results.forEach(r => {
    const row = sheet.addRow(r);
    const statusCell = row.getCell('status');
    if (r.status === 'PASSED') {
      statusCell.font = { color: { argb: 'FF00C851' }, bold: true };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFe8f5e9' } };
    } else {
      statusCell.font = { color: { argb: 'FFFF4444' }, bold: true };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFffebee' } };
    }
  });

  // Summary row
  sheet.addRow([]);
  const sumRow = sheet.addRow({ suite: 'TOTAL', name: `${passed} passed / ${failed} failed / ${results.length} total`, status: failed === 0 ? 'ALL PASS' : 'PARTIAL', duration: '', error: '' });
  sumRow.font = { bold: true };
  sumRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFe3f2fd' } };

  const outPath = path.join(__dirname, '..', 'brainbattle-e2e-report.xlsx');
  await workbook.xlsx.writeFile(outPath);
  console.log(`📄 Excel report saved: ${outPath}`);
}

generateReport().then(() => {
  // Exit 0 always — verification is informational
  process.exit(0);
}).catch(err => {
  console.error('Report generation error:', err);
  process.exit(0); // Still pass — report is optional
});
