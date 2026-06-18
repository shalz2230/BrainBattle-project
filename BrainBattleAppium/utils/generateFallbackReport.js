'use strict';
/**
 * generateFallbackReport.js
 * ─────────────────────────
 * Generates a minimal "run failed / no data" xlsx report when the
 * wdio.conf.js `after()` hook did not fire (e.g. Appium connection
 * refused, WDIO hard crash, etc.)
 *
 * Usage:
 *   node utils/generateFallbackReport.js --output appium-report.xlsx --exit-code 1
 */

'use strict';

const ExcelJS  = require('exceljs');
const path     = require('path');

// Parse CLI flags
const args     = process.argv.slice(2);
const outIdx   = args.indexOf('--output');
const exitIdx  = args.indexOf('--exit-code');
const outPath  = outIdx  !== -1 ? args[outIdx  + 1] : path.join(__dirname, '..', 'appium-report.xlsx');
const exitCode = exitIdx !== -1 ? parseInt(args[exitIdx + 1], 10) : 1;

const categories = [
  { name: 'Functional Testing',     type: 'Functionality Testing'   },
  { name: 'UI/UX Testing',          type: 'UI/UX Testing'           },
  { name: 'Compatibility Testing',  type: 'Compatibility Testing'   },
  { name: 'Performance Testing',    type: 'Performance Testing'     },
  { name: 'Security Testing',       type: 'Vulnerability Testing'   },
  { name: 'API Testing',            type: 'API Testing'             },
  { name: 'Database Testing',       type: 'Database Testing'        },
  { name: 'Accessibility Testing',  type: 'Accessibility Testing'   },
  { name: 'Mobile-Specific Testing',type: 'Mobile-Specific Testing' },
  { name: 'Regression Testing',     type: 'Regression Testing'      },
  { name: 'End-to-End Testing',     type: 'E2E Testing'             },
];

async function run() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'BrainBattle CI — Fallback';
  wb.created = new Date();

  const HDR_BG  = '1E1E2E';
  const HDR_FG  = 'CDD6F4';
  const ERR_BG  = 'F38BA8';
  const WARN_BG = 'FAB387';

  const hdrFont  = { name: 'Calibri', bold: true, color: { argb: HDR_FG }, size: 11 };
  const bodyFont = { name: 'Calibri', size: 10 };
  const border   = {
    top: { style: 'thin' }, left: { style: 'thin' },
    bottom: { style: 'thin' }, right: { style: 'thin' },
  };

  // ── Sheet 1: Summary ─────────────────────────────────────────────
  const summary = wb.addWorksheet('📊 Summary', {
    views: [{ showGridLines: false }],
  });

  summary.mergeCells('A1:E1');
  const t = summary.getCell('A1');
  t.value     = '🧠  BrainBattle Android App — Test Report (Run Failed)';
  t.font      = { name: 'Calibri', bold: true, size: 16, color: { argb: HDR_FG } };
  t.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: HDR_BG } };
  t.alignment = { vertical: 'middle', horizontal: 'center' };
  summary.getRow(1).height = 36;

  const metaRows = [
    ['', ''],
    ['Project',      'BrainBattle Android App'],
    ['Platform',     'Android (Appium / WebdriverIO)'],
    ['Run Date',     new Date().toLocaleString()],
    ['Run Status',   exitCode === 0 ? 'COMPLETED' : 'FAILED / INCOMPLETE'],
    ['Exit Code',    String(exitCode)],
    ['', ''],
    ['Total Tests',  '—  (WDIO did not complete; check logs)'],
    ['✅ Passed',    '—'],
    ['❌ Failed',    '—'],
    ['Pass Rate',    '—'],
  ];

  metaRows.forEach(([label, value], idx) => {
    const row = idx + 2;
    const lc  = summary.getCell(`B${row}`);
    const vc  = summary.getCell(`C${row}`);
    lc.value  = label;
    vc.value  = value;
    lc.font   = { name: 'Calibri', bold: true, size: 11 };
    vc.font   = { name: 'Calibri', size: 11 };
    if (label === 'Run Status' && exitCode !== 0) {
      vc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ERR_BG } };
    }
    if (label === 'Exit Code' && exitCode !== 0) {
      vc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WARN_BG } };
    }
  });

  summary.getColumn('B').width = 20;
  summary.getColumn('C').width = 50;

  // ── Sheet 2: Category breakdown (placeholder rows) ─────────────
  const catSheet = wb.addWorksheet('📂 By Category', {
    views: [{ showGridLines: false }],
  });

  catSheet.addRow(['#', 'Test Category', 'Test Type', 'Status']);
  const ch = catSheet.getRow(1);
  ch.eachCell(cell => {
    cell.font   = hdrFont;
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: HDR_BG } };
    cell.border = border;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  ch.height = 22;

  categories.forEach(({ name, type }, i) => {
    const row = catSheet.addRow([i + 1, name, type, 'NOT RUN']);
    row.eachCell(cell => {
      cell.font   = bodyFont;
      cell.border = border;
      cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFFFFF' : 'F5F5FA' } };
    });
    row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WARN_BG } };
    row.height = 20;
  });

  catSheet.columns = [{ width: 5 }, { width: 28 }, { width: 25 }, { width: 14 }];

  // ── Sheet 3: Error info ─────────────────────────────────────────
  const errSheet = wb.addWorksheet('🧪 Test Cases', {
    views: [{ showGridLines: false }],
  });

  errSheet.addRow(['#', 'Test ID', 'Test Title', 'Category', 'Test Type', 'Status', 'Duration (ms)', 'Error / Notes']);
  const eh = errSheet.getRow(1);
  eh.eachCell(cell => {
    cell.font   = hdrFont;
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: HDR_BG } };
    cell.border = border;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  eh.height = 22;

  errSheet.addRow([
    1, 'TC-CI-000', 'CI Pipeline Run', 'All', 'All',
    'ERROR',
    0,
    `WDIO process exited with code ${exitCode} before the report could be generated. Check the Appium server log and WDIO output in GitHub Actions for details.`,
  ]);
  const er = errSheet.getRow(2);
  er.eachCell(cell => {
    cell.font   = bodyFont;
    cell.border = border;
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
  });
  er.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ERR_BG } };
  er.getCell(6).font = { ...bodyFont, bold: true };

  errSheet.columns = [
    { width: 5 }, { width: 14 }, { width: 30 }, { width: 22 },
    { width: 22 }, { width: 12 }, { width: 14 }, { width: 60 },
  ];

  await wb.xlsx.writeFile(outPath);
  console.log(`✅ Fallback xlsx report written → ${outPath}`);
}

run().catch(err => {
  console.error('❌ generateFallbackReport.js failed:', err.message);
  process.exit(1);
});
