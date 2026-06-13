const Mocha = require('mocha');
const ExcelJS = require('exceljs');
const { EVENT_TEST_PASS, EVENT_TEST_FAIL } = Mocha.Runner.constants;

class ExcelReporter extends Mocha.reporters.Base {
  constructor(runner, options) {
    super(runner, options);
    this.results = [];

    runner.on(EVENT_TEST_PASS, (test) => {
      this.results.push({
        Suite: test.parent.title,
        TestName: test.title,
        Status: 'PASSED',
        Duration: `${test.duration || 0}ms`,
        Error: ''
      });
      console.log(`\x1b[32m[PASS]\x1b[0m ${test.title}`);
    });

    runner.on(EVENT_TEST_FAIL, (test, err) => {
      this.results.push({
        Suite: test.parent.title,
        TestName: test.title,
        Status: 'FAILED',
        Duration: `${test.duration || 0}ms`,
        Error: err.message
      });
      console.log(`\x1b[31m[FAIL]\x1b[0m ${test.title}`);
    });
  }

  async done(failures, exit) {
    try {
      console.log('Generating Excel report...');
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Selenium Test Report');

      sheet.columns = [
        { header: 'Suite', key: 'Suite', width: 30 },
        { header: 'Test Name', key: 'TestName', width: 50 },
        { header: 'Status', key: 'Status', width: 15 },
        { header: 'Duration', key: 'Duration', width: 15 },
        { header: 'Error', key: 'Error', width: 60 }
      ];

      // Style header
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

      this.results.forEach((res) => {
        const row = sheet.addRow(res);
        if (res.Status === 'PASSED') {
          row.getCell('Status').font = { color: { argb: 'FF008000' }, bold: true };
        } else {
          row.getCell('Status').font = { color: { argb: 'FFFF0000' }, bold: true };
        }
      });

      await workbook.xlsx.writeFile('selenium-report.xlsx');
      console.log('Excel report saved to selenium-report.xlsx');
    } catch (e) {
      console.error('Failed to generate Excel report:', e);
    } finally {
      if (exit) {
        exit(failures);
      }
    }
  }
}

module.exports = ExcelReporter;
