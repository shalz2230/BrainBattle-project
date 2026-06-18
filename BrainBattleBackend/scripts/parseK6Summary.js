const fs = require('fs');
const path = require('path');

const summaryFile = path.join(process.cwd(), 'summary.json');
const stepSummaryFile = process.env.GITHUB_STEP_SUMMARY;

if (!fs.existsSync(summaryFile)) {
  console.error("k6 summary file not found!");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));

const rps = data.metrics.http_reqs.values.rate.toFixed(2);
const totalReqs = data.metrics.http_reqs.values.count;
const avgTime = data.metrics.http_req_duration.values.avg.toFixed(2);
const minTime = data.metrics.http_req_duration.values.min.toFixed(2);
const maxTime = data.metrics.http_req_duration.values.max.toFixed(2);
const p95Time = data.metrics.http_req_duration.values['p(95)'].toFixed(2);
const failRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
const checksPassed = data.metrics.checks ? (data.metrics.checks.values.passes) : 0;
const checksTotal = data.metrics.checks ? (data.metrics.checks.values.passes + data.metrics.checks.values.fails) : 0;
const checksRate = checksTotal > 0 ? ((checksPassed / checksTotal) * 100).toFixed(2) : '100.00';

let markdown = `# 📈 BrainBattle API Load Test Executive Summary\n\n`;
markdown += `> **Execution Date:** ${new Date().toUTCString()}  \n`;
markdown += `> **Target Host:** ${process.env.BACKEND_URL || 'https://brainbattlewebbackend.onrender.com/'}  \n`;
markdown += `> **Configuration:** 100 Virtual Users (VUs) running for 1 minute\n\n`;
markdown += `---\n\n`;

markdown += `## 📊 Performance Metrics\n\n`;
markdown += `| Metric | Value | Description |\n`;
markdown += `|--------|-------|-------------|\n`;
markdown += `| **Requests Per Second (RPS)** | **${rps} req/sec** | Average throughput during the run |\n`;
markdown += `| **Total Requests Sent** | **${totalReqs}** | Cumulative requests dispatched |\n`;
markdown += `| **Average Response Time** | **${avgTime} ms** | Mean response latency |\n`;
markdown += `| **Minimum Response Time** | **${minTime} ms** | Fastest request round-trip |\n`;
markdown += `| **Maximum Response Time** | **${maxTime} ms** | Slowest request round-trip (95th percentile: ${p95Time} ms) |\n`;
markdown += `| **Request Failure Rate** | **${failRate}%** | Percentage of failed HTTP requests (should be < 5%) |\n`;
markdown += `| **Checks Pass Rate** | **${checksRate}%** | Verification assertions pass rate (${checksPassed}/${checksTotal}) |\n\n`;

markdown += `---\n\n`;
markdown += `## 🏆 Test Verdict\n\n`;

const success = failRate < 5 && parseFloat(avgTime) < 1500;
if (success) {
  markdown += `### ✅ **PASSED**\n`;
  markdown += `The backend API handles normal concurrent loads efficiently. Response times are fast and failure rates are well within the 5% threshold.\n`;
} else {
  markdown += `### ❌ **FAILED**\n`;
  markdown += `Performance degradation detected. High latency or excessive request failures observed under concurrent load.\n`;
}

if (stepSummaryFile) {
  fs.writeFileSync(stepSummaryFile, markdown);
  console.log("Successfully wrote summary to GitHub Actions step summary!");
} else {
  console.log(markdown);
}
