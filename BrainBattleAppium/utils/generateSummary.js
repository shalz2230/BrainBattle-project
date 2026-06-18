const fs = require('fs');
const path = require('path');

const resultsPath = path.join(process.cwd(), '.wdio-results.jsonl');
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

let total = 0;
let passed = 0;
let failed = 0;
let skipped = 0;
let totalDuration = 0;
const categories = {};

if (fs.existsSync(resultsPath)) {
    const lines = fs.readFileSync(resultsPath, 'utf8').split('\n').filter(Boolean);
    lines.forEach(line => {
        try {
            const result = JSON.parse(line);
            total++;
            totalDuration += result.duration || 0;
            
            if (result.status === 'passed') passed++;
            else if (result.status === 'failed') failed++;
            else skipped++;

            const cat = result.category || 'General';
            if (!categories[cat]) {
                categories[cat] = { total: 0, passed: 0, failed: 0, skipped: 0 };
            }
            categories[cat].total++;
            if (result.status === 'passed') categories[cat].passed++;
            else if (result.status === 'failed') categories[cat].failed++;
            else categories[cat].skipped++;
        } catch (e) {
            // ignore malformed lines
        }
    });
}

const statusBadge = failed > 0 || total === 0 ? "❌ Failed / Partial" : "✅ Passed";
const durationStr = (totalDuration / 1000).toFixed(2) + 's';

let md = `## 📱 Mobile Appium Test Report — ${statusBadge}\n\n`;
md += `### 📊 Summary Statistics\n\n`;
md += `| Metric | Count | Description |\n`;
md += `| --- | --- | --- |\n`;
md += `| **Total Test Cases** | \`${total}\` | Total parametric tests executed |\n`;
md += `| **Passed** | \`${passed}\` | Tests that succeeded |\n`;
md += `| **Failed** | \`${failed}\` | Tests that encountered errors |\n`;
md += `| **Skipped** | \`${skipped}\` | Tests that were skipped/pending |\n`;
md += `| **Total Duration** | \`${durationStr}\` | Total test suite execution time |\n\n`;

md += `### 📋 Breakdown by Test Category\n\n`;
md += `| Category | Total | Passed | Failed | Skipped | Pass Rate |\n`;
md += `| --- | --- | --- | --- | --- | --- |\n`;

for (const [cat, stats] of Object.entries(categories)) {
    const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) + '%' : '0%';
    const badge = stats.failed > 0 ? '❌' : '✅';
    md += `| ${badge} ${cat} | ${stats.total} | ${stats.passed} | ${stats.failed} | ${stats.skipped} | **${rate}** |\n`;
}

md += `\n📥 Download **\`BrainBattle-Mobile-Test-Report-${process.env.GITHUB_RUN_NUMBER || '1'}\`** from Artifacts for the full Excel report.\n`;

if (summaryPath) {
    fs.appendFileSync(summaryPath, md);
} else {
    console.log(md);
}
