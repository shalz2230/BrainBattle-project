'use strict';

/**
 * BrainBattle Appium — XLSX Report Generator
 * Reads mocha test results collected via the custom reporter hooks
 * and writes a styled Excel workbook with:
 *   - Cover sheet (summary)
 *   - Per-category breakdown sheet
 *   - Full test-case detail sheet
 *
 * Usage (called by the WDIO after-hook or standalone):
 *   node utils/xlsxReporter.js
 */

const ExcelJS = require('exceljs');
const fs      = require('fs');
const path    = require('path');

// ─── Shared in-memory result store (populated by WDIO hooks) ─────────
const _results = {
  runMeta: {
    project:     'BrainBattle Android App',
    platform:    'Android (Appium / WebdriverIO)',
    startTime:   null,
    endTime:     null,
    totalTests:  0,
    totalPassed: 0,
    totalFailed: 0,
    totalSkipped:0,
  },
  rows: [],   // { id, title, category, type, status, duration, error }
};

/** Called from WDIO before-hook to start the clock */
function startRun() {
  _results.runMeta.startTime = new Date();
}

/** Called from WDIO after each test */
function recordTest({ id, title, category, type, status, duration, error }) {
  _results.rows.push({ id, title, category, type, status, duration: duration || 0, error: error || '' });
  _results.runMeta.totalTests++;
  if (status === 'passed')  _results.runMeta.totalPassed++;
  else if (status === 'failed') _results.runMeta.totalFailed++;
  else _results.runMeta.totalSkipped++;
}

/** Main: builds and saves the workbook. Returns the output file path. */
async function generateReport(outputPath) {
  _results.runMeta.endTime = new Date();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'BrainBattle CI';
  wb.created = new Date();

  // ── Colour palette ──────────────────────────────────────────────
  const C = {
    headerBg:    '1E1E2E',   // dark navy  (header rows)
    headerFg:    'CDD6F4',   // lavender   (header text)
    passedBg:    'A6E3A1',   // green
    failedBg:    'F38BA8',   // red
    skippedBg:   'FAB387',   // peach
    coverBg:     '313244',   // dark surface
    coverFg:     'CDD6F4',
    altRow:      'F5F5FA',   // light stripe
    border:      'B0B0C0',
    catColors: {
      'Functionality':    'BAE1FF',
      'UI/UX':            'BAFFC9',
      'Validation':       'FFFFBA',
      'Vulnerability':    'FFB3BA',
      'Unit Testing':     'E8BAFF',
      'Compatibility':    'FFD9BA',
      'Performance':      'BAF0FF',
      'Security':         'FFBAD2',
      'API':              'D4FFBA',
      'Database':         'FFF0BA',
      'Accessibility':    'C9BAFF',
      'Mobile-Specific':  'FFECBA',
      'Regression':       'BAFFEE',
      'E2E':              'FFBAF0',
    },
  };

  const border = (color) => ({
    top:    { style: 'thin', color: { argb: color } },
    left:   { style: 'thin', color: { argb: color } },
    bottom: { style: 'thin', color: { argb: color } },
    right:  { style: 'thin', color: { argb: color } },
  });

  const headerFont  = { name: 'Calibri', bold: true, color: { argb: C.headerFg }, size: 11 };
  const cellFont    = { name: 'Calibri', size: 10 };
  const titleFont   = { name: 'Calibri', bold: true, size: 16, color: { argb: 'CDD6F4' } };

  // ═══════════════════════════════════════════════════════════════
  // SHEET 1 — COVER / SUMMARY
  // ═══════════════════════════════════════════════════════════════
  const coverSheet = wb.addWorksheet('📊 Summary', {
    properties: { tabColor: { argb: '6C91C2' } },
    views: [{ showGridLines: false }],
  });

  coverSheet.mergeCells('A1:F1');
  const titleCell = coverSheet.getCell('A1');
  titleCell.value = '🧠  BrainBattle Android App — Test Report';
  titleCell.font  = titleFont;
  titleCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  coverSheet.getRow(1).height = 36;

  const meta = _results.runMeta;
  const passRate = meta.totalTests > 0
    ? ((meta.totalPassed / meta.totalTests) * 100).toFixed(1)
    : '0.0';

  const duration = meta.startTime && meta.endTime
    ? ((meta.endTime - meta.startTime) / 1000).toFixed(0) + 's'
    : 'N/A';

  const metaRows = [
    ['', ''],
    ['Project',       meta.project],
    ['Platform',      meta.platform],
    ['Run Date',      meta.startTime ? meta.startTime.toLocaleString() : 'N/A'],
    ['Duration',      duration],
    ['', ''],
    ['Total Tests',   meta.totalTests],
    ['✅ Passed',     meta.totalPassed],
    ['❌ Failed',     meta.totalFailed],
    ['⏭️ Skipped',   meta.totalSkipped],
    ['Pass Rate',     passRate + '%'],
  ];

  metaRows.forEach(([label, value], idx) => {
    const rowNum = idx + 2;
    const labelCell = coverSheet.getCell(`B${rowNum}`);
    const valueCell = coverSheet.getCell(`C${rowNum}`);
    labelCell.value = label;
    valueCell.value = value;
    labelCell.font  = { name: 'Calibri', bold: true, size: 11 };
    valueCell.font  = { name: 'Calibri', size: 11 };
    if (label === '✅ Passed')  valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.passedBg } };
    if (label === '❌ Failed')  valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.failedBg } };
    if (label === 'Pass Rate') {
      const rate = parseFloat(passRate);
      valueCell.fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: rate >= 80 ? C.passedBg : rate >= 50 ? 'FAB387' : C.failedBg },
      };
    }
  });

  coverSheet.getColumn('A').width = 3;
  coverSheet.getColumn('B').width = 20;
  coverSheet.getColumn('C').width = 35;

  // ═══════════════════════════════════════════════════════════════
  // SHEET 2 — CATEGORY BREAKDOWN
  // ═══════════════════════════════════════════════════════════════
  const catSheet = wb.addWorksheet('📂 By Category', {
    properties: { tabColor: { argb: '89B4FA' } },
    views: [{ showGridLines: false }],
  });

  const catHeaders = ['#', 'Test Category', 'Test Type', 'Total', 'Passed', 'Failed', 'Skipped', 'Pass Rate'];
  catSheet.addRow(catHeaders);
  const catHdrRow = catSheet.getRow(1);
  catHdrRow.eachCell(cell => {
    cell.font      = headerFont;
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border    = border(C.border);
  });
  catHdrRow.height = 22;

  // Build category stats
  const catMap = {};
  _results.rows.forEach(r => {
    const key = r.category || 'Uncategorised';
    if (!catMap[key]) catMap[key] = { type: r.type || '', total: 0, passed: 0, failed: 0, skipped: 0 };
    catMap[key].total++;
    if (r.status === 'passed')  catMap[key].passed++;
    else if (r.status === 'failed') catMap[key].failed++;
    else catMap[key].skipped++;
  });

  Object.entries(catMap).forEach(([name, stats], idx) => {
    const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) + '%' : '0%';
    const row = catSheet.addRow([
      idx + 1, name, stats.type, stats.total, stats.passed, stats.failed, stats.skipped, rate,
    ]);
    const bg = C.catColors[name] || (idx % 2 === 0 ? 'FFFFFF' : C.altRow);
    row.eachCell(cell => {
      cell.font      = cellFont;
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
      cell.border    = border(C.border);
    });
    row.getCell(2).alignment = { horizontal: 'left' };
    row.getCell(3).alignment = { horizontal: 'left' };

    // Colour the pass-rate cell
    const rateCell = row.getCell(8);
    const rateNum  = parseFloat(rate);
    rateCell.fill  = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: rateNum >= 80 ? C.passedBg : rateNum >= 50 ? 'FAB387' : C.failedBg },
    };
    row.height = 20;
  });

  catSheet.columns = [
    { width: 5  },  // #
    { width: 28 },  // Category
    { width: 22 },  // Type
    { width: 9  },  // Total
    { width: 9  },  // Passed
    { width: 9  },  // Failed
    { width: 9  },  // Skipped
    { width: 12 },  // Rate
  ];
  catSheet.autoFilter = 'A1:H1';

  // ═══════════════════════════════════════════════════════════════
  // SHEET 3 — FULL TEST CASE DETAIL
  // ═══════════════════════════════════════════════════════════════
  const detailSheet = wb.addWorksheet('🧪 Test Cases', {
    properties: { tabColor: { argb: 'A6E3A1' } },
    views: [{ showGridLines: false, state: 'frozen', xSplit: 0, ySplit: 1 }],
  });

  const detailHeaders = [
    '#', 'Test ID', 'Test Title', 'Category', 'Test Type', 'Status', 'Duration (ms)', 'Error / Notes'
  ];
  detailSheet.addRow(detailHeaders);
  const detailHdrRow = detailSheet.getRow(1);
  detailHdrRow.eachCell(cell => {
    cell.font      = headerFont;
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border    = border(C.border);
  });
  detailHdrRow.height = 22;

  _results.rows.forEach((r, idx) => {
    const row = detailSheet.addRow([
      idx + 1,
      r.id    || `TC-${String(idx + 1).padStart(3, '0')}`,
      r.title || '',
      r.category || '',
      r.type  || '',
      r.status ? r.status.toUpperCase() : 'UNKNOWN',
      r.duration,
      r.error || '',
    ]);

    const isEven  = idx % 2 === 0;
    const baseFill = isEven ? 'FFFFFF' : C.altRow;
    row.eachCell((cell, col) => {
      cell.font      = cellFont;
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: baseFill } };
      cell.alignment = { vertical: 'middle', horizontal: col <= 2 || col === 6 ? 'center' : 'left', wrapText: false };
      cell.border    = border(C.border);
    });

    // Status colour-coded cell
    const statusCell = row.getCell(6);
    const status = r.status || '';
    statusCell.fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: {
        argb: status === 'passed'  ? C.passedBg
            : status === 'failed'  ? C.failedBg
            : C.skippedBg,
      },
    };
    statusCell.font = { ...cellFont, bold: true };

    // Category colour
    const catCell = row.getCell(4);
    const catColor = C.catColors[r.category];
    if (catColor) {
      catCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: catColor } };
    }

    row.height = 18;
  });

  detailSheet.columns = [
    { width: 5  },  // #
    { width: 18 },  // ID
    { width: 55 },  // Title
    { width: 22 },  // Category
    { width: 20 },  // Type
    { width: 12 },  // Status
    { width: 14 },  // Duration
    { width: 40 },  // Error
  ];
  detailSheet.autoFilter = 'A1:H1';

  // ── Save ────────────────────────────────────────────────────────
  const out = outputPath || path.join(process.cwd(), 'appium-report.xlsx');
  await wb.xlsx.writeFile(out);
  console.log(`\n✅ Appium XLSX report saved → ${out}`);
  return out;
}

module.exports = { startRun, recordTest, generateReport, _results };
