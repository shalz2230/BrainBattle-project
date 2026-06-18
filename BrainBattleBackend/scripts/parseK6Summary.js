const fs = require('fs');
const path = require('path');

const summaryFile = path.join(process.cwd(), 'summary.json');
const stepSummaryFile = process.env.GITHUB_STEP_SUMMARY;

if (!fs.existsSync(summaryFile)) {
  console.error("k6 summary file not found!");
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
} catch (e) {
  console.error("Failed to parse summary.json as JSON:", e.message);
  process.exit(1);
}

console.log("Successfully loaded summary.json");
if (data && data.metrics) {
  console.log("Metrics available:", Object.keys(data.metrics));
  // Print a sample metric for diagnostics
  const sampleKey = Object.keys(data.metrics)[0];
  if (sampleKey) {
    console.log(`Sample metric structure for '${sampleKey}':`, JSON.stringify(data.metrics[sampleKey], null, 2));
  }
} else {
  console.log("No metrics found in summary.json structure!");
}

// Helper: Safely resolve a metric's value across flat or nested structures
function getMetricValue(metricObj, key) {
  if (!metricObj) return undefined;
  // Try nested values first
  if (metricObj.values && metricObj.values[key] !== undefined) {
    return metricObj.values[key];
  }
  // Fallback to flat properties
  if (metricObj[key] !== undefined) {
    return metricObj[key];
  }
  // Fallback to searching custom sub-keys
  return undefined;
}

// Safely extract metrics with default fallbacks
const httpReqs = data.metrics?.http_reqs;
const rpsVal = getMetricValue(httpReqs, 'rate');
const rps = typeof rpsVal === 'number' ? rpsVal.toFixed(2) : '0.00';

const totalReqsVal = getMetricValue(httpReqs, 'count');
const totalReqs = typeof totalReqsVal === 'number' ? totalReqsVal : 0;

const httpDuration = data.metrics?.http_req_duration;
const avgVal = getMetricValue(httpDuration, 'avg');
const avgTime = typeof avgVal === 'number' ? avgVal.toFixed(2) : '0.00';

const minVal = getMetricValue(httpDuration, 'min');
const minTime = typeof minVal === 'number' ? minVal.toFixed(2) : '0.00';

const maxVal = getMetricValue(httpDuration, 'max');
const maxTime = typeof maxVal === 'number' ? maxVal.toFixed(2) : '0.00';

const p95Val = getMetricValue(httpDuration, 'p(95)');
const p95Time = typeof p95Val === 'number' ? p95Val.toFixed(2) : '0.00';

const httpFailed = data.metrics?.http_req_failed;
const failVal = getMetricValue(httpFailed, 'rate');
const failRate = typeof failVal === 'number' ? (failVal * 100).toFixed(2) : '0.00';

// Checks stats
let checksRate = '100.00';
let checksPassed = 0;
let checksTotal = 0;
if (data.metrics?.checks) {
  const checksObj = data.metrics.checks;
  checksPassed = getMetricValue(checksObj, 'passes') || 0;
  const checksFailed = getMetricValue(checksObj, 'fails') || 0;
  checksTotal = checksPassed + checksFailed;
  if (checksTotal > 0) {
    checksRate = ((checksPassed / checksTotal) * 100).toFixed(2);
  }
}

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

const success = parseFloat(failRate) < 5 && parseFloat(avgTime) < 1500;
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
