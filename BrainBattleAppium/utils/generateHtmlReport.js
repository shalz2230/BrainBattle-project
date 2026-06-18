const fs = require('fs');
const path = require('path');

const resultsPath = path.join(process.cwd(), '.wdio-results.jsonl');
const outPath = process.env.HTML_OUTPUT || path.join(process.cwd(), 'execution-report.html');

let total = 0;
let passed = 0;
let failed = 0;
let skipped = 0;
let totalDuration = 0;
let testRowsHtml = '';

if (fs.existsSync(resultsPath)) {
    const lines = fs.readFileSync(resultsPath, 'utf8').split('\n').filter(Boolean);
    lines.forEach((line, index) => {
        try {
            const result = JSON.parse(line);
            total++;
            totalDuration += result.duration || 0;
            
            let statusClass = 'status-skipped';
            if (result.status === 'passed') {
                passed++;
                statusClass = 'status-passed';
            } else if (result.status === 'failed') {
                failed++;
                statusClass = 'status-failed';
            } else {
                skipped++;
            }

            const durationSec = ((result.duration || 0) / 1000).toFixed(2) + 's';
            const errorHtml = result.error ? `<div class="error-msg">${escapeHtml(result.error)}</div>` : 'None';

            testRowsHtml += `
            <tr>
                <td>${index + 1}</td>
                <td><span class="badge badge-info">${escapeHtml(result.id || 'N/A')}</span></td>
                <td><strong>${escapeHtml(result.title)}</strong></td>
                <td><span class="category-tag">${escapeHtml(result.category || 'General')}</span></td>
                <td>${escapeHtml(result.type || 'E2E Testing')}</td>
                <td><span class="status-badge ${statusClass}">${result.status.toUpperCase()}</span></td>
                <td>${durationSec}</td>
                <td class="error-col">${errorHtml}</td>
            </tr>`;
        } catch (e) {}
    });
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
const durationStr = (totalDuration / 1000).toFixed(2) + 's';
const runDate = new Date().toLocaleString();

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BrainBattle Appium Test Execution Report</title>
    <style>
        :root {
            --bg-color: #0f0f1a;
            --surface-color: #1e1e2e;
            --text-color: #cdd6f4;
            --text-muted: #a6adc8;
            --primary: #89b4fa;
            --success: #a6e3a1;
            --danger: #f38ba8;
            --warning: #fab387;
            --border-color: #313244;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        header {
            background: linear-gradient(135deg, #313244, #181825);
            padding: 30px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            margin-bottom: 25px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
        h1 {
            margin: 0 0 10px 0;
            color: var(--primary);
            font-size: 28px;
        }
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .meta-item {
            background: rgba(255, 255, 255, 0.03);
            padding: 12px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .meta-label {
            font-size: 12px;
            color: var(--text-muted);
            text-transform: uppercase;
        }
        .meta-value {
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }
        .card {
            background-color: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .card-number {
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
        }
        .card-label {
            color: var(--text-muted);
            font-size: 14px;
            text-transform: uppercase;
        }
        .passed-card { border-left: 6px solid var(--success); }
        .passed-card .card-number { color: var(--success); }
        .failed-card { border-left: 6px solid var(--danger); }
        .failed-card .card-number { color: var(--danger); }
        .total-card { border-left: 6px solid var(--primary); }
        .total-card .card-number { color: var(--primary); }
        .rate-card { border-left: 6px solid var(--warning); }
        .rate-card .card-number { color: var(--warning); }

        table {
            width: 100%;
            border-collapse: collapse;
            background-color: var(--surface-color);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            margin-bottom: 30px;
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        th {
            background-color: rgba(255,255,255,0.02);
            font-weight: bold;
            color: var(--primary);
        }
        tr:hover {
            background-color: rgba(255,255,255,0.01);
        }
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            display: inline-block;
        }
        .status-passed { background-color: rgba(166, 227, 161, 0.15); color: var(--success); }
        .status-failed { background-color: rgba(243, 139, 168, 0.15); color: var(--danger); }
        .status-skipped { background-color: rgba(250, 179, 135, 0.15); color: var(--warning); }
        
        .badge {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-family: monospace;
        }
        .badge-info { background: #313244; color: #cdd6f4; }
        
        .category-tag {
            background-color: rgba(137, 180, 250, 0.1);
            color: var(--primary);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
        }
        .error-msg {
            color: var(--danger);
            font-family: monospace;
            font-size: 11px;
            white-space: pre-wrap;
            max-width: 350px;
            background: rgba(243, 139, 168, 0.05);
            padding: 8px;
            border-radius: 4px;
            border: 1px solid rgba(243, 139, 168, 0.1);
        }
        .error-col {
            max-width: 350px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🧠 BrainBattle Appium E2E Automation Report</h1>
            <p style="margin: 0; color: var(--text-muted);">Physical Mobile Device & Emulator Automation Suite</p>
            <div class="meta-grid">
                <div class="meta-item">
                    <div class="meta-label">Execution Date</div>
                    <div class="meta-value">${runDate}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Platform</div>
                    <div class="meta-value">Android (Appium + WebdriverIO)</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Total Duration</div>
                    <div class="meta-value">${durationStr}</div>
                </div>
            </div>
        </header>

        <div class="stats-grid">
            <div class="card total-card">
                <div class="card-label">Total Tests</div>
                <div class="card-number">${total}</div>
            </div>
            <div class="card passed-card">
                <div class="card-label">Passed</div>
                <div class="card-number">${passed}</div>
            </div>
            <div class="card failed-card">
                <div class="card-label">Failed</div>
                <div class="card-number">${failed}</div>
            </div>
            <div class="card rate-card">
                <div class="card-label">Pass Rate</div>
                <div class="card-number">${passRate}%</div>
            </div>
        </div>

        <h2 style="color: var(--primary); margin-bottom: 15px;">🧪 Test Case Details</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 50px;">#</th>
                    <th style="width: 100px;">Test ID</th>
                    <th>Test Title</th>
                    <th style="width: 150px;">Category</th>
                    <th style="width: 150px;">Testing Type</th>
                    <th style="width: 100px;">Status</th>
                    <th style="width: 100px;">Duration</th>
                    <th>Errors / Logs</th>
                </tr>
            </thead>
            <tbody>
                ${testRowsHtml || '<tr><td colspan="8" style="text-align:center;">No test results found. Check test runner logs.</td></tr>'}
            </tbody>
        </table>
    </div>
</body>
</html>`;

fs.writeFileSync(outPath, htmlContent);
console.log(`✅ HTML execution report saved → ${outPath}`);
