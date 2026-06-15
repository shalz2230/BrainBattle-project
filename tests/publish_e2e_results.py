import os
import openpyxl

def get_detail_val(row_dict, possible_keys, default_val=''):
    if isinstance(possible_keys, str):
        possible_keys = [possible_keys]
    for key in possible_keys:
        if key in row_dict:
            return row_dict[key]
        for k in row_dict.keys():
            if str(k).lower() == str(key).lower():
                return row_dict[k]
    return default_val

def get_summary_val(summary_dict, possible_keys, default_val=''):
    if isinstance(possible_keys, str):
        possible_keys = [possible_keys]
    for key in possible_keys:
        if key in summary_dict:
            return summary_dict[key]
        for k in summary_dict.keys():
            if str(k).lower() == str(key).lower():
                return summary_dict[k]
    return default_val

def format_pass_rate(rate_str):
    return str(rate_str)

def parse_report(filepath):
    wb = openpyxl.load_workbook(filepath, data_only=True)
    sheet_names = wb.sheetnames
    
    ws_summary = None
    if 'Summary' in sheet_names:
        ws_summary = wb['Summary']
    elif 'summary' in [s.lower() for s in sheet_names]:
        ws_summary = wb[next(s for s in sheet_names if s.lower() == 'summary')]
        
    ws_details = None
    details_candidates = ['Test Details', 'Test Cases', 'test details', 'test cases']
    for candidate in details_candidates:
        if candidate in sheet_names:
            ws_details = wb[candidate]
            break
            
    if ws_details is None:
        for candidate in details_candidates:
            matching = [s for s in sheet_names if candidate.lower() in s.lower()]
            if matching:
                ws_details = wb[matching[0]]
                break
                
    if ws_details is None:
        non_summary_sheets = [s for s in sheet_names if 'summary' not in s.lower()]
        if non_summary_sheets:
            ws_details = wb[non_summary_sheets[0]]
        else:
            ws_details = wb[sheet_names[0]]
            
    summary_dict = {}
    detail_rows = list(ws_details.values)
    details = []
    if detail_rows:
        detail_headers = [str(h) if h is not None else f"Col{i}" for i, h in enumerate(detail_rows[0])]
        for r in detail_rows[1:]:
            if r and r[0] is not None:
                details.append(dict(zip(detail_headers, r)))
                
    if ws_summary is not None:
        rows = list(ws_summary.values)
        if rows:
            first_row = rows[0]
            if len(first_row) == 2 and str(first_row[0]).lower() in ['metric', 'key'] and str(first_row[1]).lower() in ['value', 'val']:
                for r in rows[1:]:
                    if r and len(r) >= 2 and r[0] is not None:
                        summary_dict[str(r[0])] = r[1]
            else:
                headers = [str(h) for h in rows[0]]
                data = rows[1] if len(rows) > 1 else [None]*len(headers)
                summary_dict = dict(zip(headers, data))
    else:
        total_tests = len(details)
        passed = 0
        failed = 0
        for d in details:
            st = str(get_detail_val(d, ['Status', 'Result'])).lower()
            if 'pass' in st or st == 'ok' or st == 'true':
                passed += 1
            else:
                failed += 1
        pass_rate = (passed / total_tests * 100) if total_tests > 0 else 100.0
        
        summary_dict = {
            'Test Suite': 'E2E Test Suite',
            'Total Tests': total_tests,
            'Passed': passed,
            'Failed': failed,
            'Pass Rate %': f"{pass_rate:.1f}%",
            'Duration (sec)': 'N/A',
            'End Time': 'N/A'
        }
            
    return summary_dict, details

def main():
    import sys
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')

    tests_dir = os.path.dirname(os.path.abspath(__file__))
    reports_dir = os.path.join(tests_dir, "reports")
    
    e2e_file = None
    appium_file = None
    
    if os.path.exists(reports_dir):
        for f in sorted(os.listdir(reports_dir)):
            if f.startswith("E2E_Test_Report_BrainBattle_") and f.endswith(".xlsx"):
                e2e_file = f
            elif f.startswith("Appium_Test_Report_BrainBattle_") and f.endswith(".xlsx"):
                appium_file = f
                
    e2e_path = os.path.join(reports_dir, e2e_file if e2e_file else "E2E_Test_Report_BrainBattle.xlsx")
    appium_path = os.path.join(reports_dir, appium_file if appium_file else "Appium_Test_Report_BrainBattle.xlsx")
    
    files_missing = []
    if not os.path.exists(e2e_path): files_missing.append(f"E2E report (expected: {e2e_path})")
    if not os.path.exists(appium_path): files_missing.append(f"Appium report (expected: {appium_path})")
    
    if files_missing:
        print("Error: Missing report files:")
        for m in files_missing:
            print(f" - {m}")
        sys.exit(1)
        
    e2e_summary, e2e_details = parse_report(e2e_path)
    appium_summary, appium_details = parse_report(appium_path)
    
    markdown_output = []
    markdown_output.append("# 📊 BrainBattle Automated E2E & Mobile Test Dashboard\n")
    markdown_output.append("This dashboard displays the test results verified from the completed E2E web and Appium mobile test execution reports.\n")
    
    # 1. E2E Test Suite Summary
    markdown_output.append("## 🌐 E2E Web Test Suite Summary")
    markdown_output.append("| Metric | Value |")
    markdown_output.append("|---|---|")
    markdown_output.append(f"| **Test Suite** | {get_summary_val(e2e_summary, ['Test Suite'], 'BrainBattle E2E Web Tests')} |")
    markdown_output.append(f"| **Total Test Cases** | {get_summary_val(e2e_summary, ['Total Tests', 'Total Test Cases'])} |")
    markdown_output.append(f"| **Passed** | ✅ {get_summary_val(e2e_summary, ['Passed', 'Total PASS'])} |")
    markdown_output.append(f"| **Failed** | ❌ {get_summary_val(e2e_summary, ['Failed', 'Total FAIL'])} |")
    markdown_output.append(f"| **Pass Rate** | **{format_pass_rate(get_summary_val(e2e_summary, ['Pass Rate %', 'Pass Percentage']))}** |")
    markdown_output.append(f"| **Duration** | {get_summary_val(e2e_summary, ['Duration (sec)', 'Execution Time'])} |")
    markdown_output.append(f"| **Timestamp** | {get_summary_val(e2e_summary, ['End Time', 'Execution Date'])} |")
    markdown_output.append("\n")
    
    # 2. Appium Mobile Test Suite Summary
    markdown_output.append("## 📱 Appium Mobile Test Suite Summary")
    markdown_output.append("| Metric | Value |")
    markdown_output.append("|---|---|")
    markdown_output.append(f"| **Device Tested** | 📱 {get_summary_val(appium_summary, ['Device Tested'], 'N/A')} |")
    markdown_output.append(f"| **Android Version** | {get_summary_val(appium_summary, ['Android Version'], 'N/A')} |")
    markdown_output.append(f"| **App Version** | {get_summary_val(appium_summary, ['App Version'], 'N/A')} |")
    markdown_output.append(f"| **Total Test Cases** | {get_summary_val(appium_summary, ['Total Test Cases', 'Total Tests', 'Total Test Cases'])} |")
    markdown_output.append(f"| **Passed** | ✅ {get_summary_val(appium_summary, ['Passed', 'Total PASS'])} |")
    markdown_output.append(f"| **Failed** | ❌ {get_summary_val(appium_summary, ['Failed', 'Total FAIL'])} |")
    markdown_output.append(f"| **Pass Rate** | **{format_pass_rate(get_summary_val(appium_summary, ['Pass Percentage', 'Pass Rate %', 'Pass Rate']))}** |")
    markdown_output.append(f"| **Duration** | {get_summary_val(appium_summary, ['Execution Time', 'Duration (sec)'])} |")
    markdown_output.append(f"| **Timestamp** | {get_summary_val(appium_summary, ['Execution Date', 'End Time'])} |")
    markdown_output.append("\n")
    
    # Module-wise Summary: E2E
    markdown_output.append("### 📊 E2E Web Module-wise Summary")
    markdown_output.append("| Module | Total | Passed | Failed | Pass Rate |")
    markdown_output.append("|---|---|---|---|---|")
    module_stats = {}
    for r in e2e_details:
        mod = get_detail_val(r, ['Category', 'Module / Feature', 'Module'], 'Uncategorized')
        st = str(get_detail_val(r, ['Status', 'Result'])).upper()
        if mod not in module_stats:
            module_stats[mod] = {'total': 0, 'pass': 0, 'fail': 0}
        module_stats[mod]['total'] += 1
        if 'PASS' in st or st == 'OK':
            module_stats[mod]['pass'] += 1
        else:
            module_stats[mod]['fail'] += 1
    for mod, stats in module_stats.items():
        rate = (stats['pass'] / stats['total']) * 100
        markdown_output.append(f"| **{mod}** | {stats['total']} | ✅ {stats['pass']} | ❌ {stats['fail']} | **{rate:.1f}%** |")
    markdown_output.append("\n")

    # Expandable Details: E2E
    markdown_output.append("### 🔍 E2E Web Test Cases Detail Breakdowns")
    markdown_output.append(f"<details><summary>Click to view all E2E Web Test Cases ({len(e2e_details)} tests)</summary>\n")
    markdown_output.append("| No. | Category | Test Name | Status |")
    markdown_output.append("|---|---|---|---|")
    for r in e2e_details:
        no = get_detail_val(r, ['No.', '#', 'Test Case ID'])
        category = get_detail_val(r, ['Category', 'Module / Feature', 'Module'])
        test_name = get_detail_val(r, ['Test Name', 'Test Case Name', 'Test Case'])
        status = str(get_detail_val(r, ['Status', 'Result'])).upper()
        status_emoji = "✅ PASSED" if "PASS" in status or status == "OK" else "❌ FAILED"
        markdown_output.append(f"| {no} | {category} | `{test_name}` | {status_emoji} |")
    markdown_output.append("\n</details>\n")
    
    # Module-wise Summary: Appium
    markdown_output.append("### 📊 Appium Mobile Module-wise Summary")
    markdown_output.append("| Module | Total | Passed | Failed | Pass Rate |")
    markdown_output.append("|---|---|---|---|---|")
    appium_module_stats = {}
    for r in appium_details:
        mod = get_detail_val(r, ['Module', 'Category'], 'Uncategorized')
        st = str(get_detail_val(r, ['Status', 'Result'])).upper()
        if mod not in appium_module_stats:
            appium_module_stats[mod] = {'total': 0, 'pass': 0, 'fail': 0}
        appium_module_stats[mod]['total'] += 1
        if 'PASS' in st or st == 'OK':
            appium_module_stats[mod]['pass'] += 1
        else:
            appium_module_stats[mod]['fail'] += 1
    for mod, stats in appium_module_stats.items():
        rate = (stats['pass'] / stats['total']) * 100
        markdown_output.append(f"| **{mod}** | {stats['total']} | ✅ {stats['pass']} | ❌ {stats['fail']} | **{rate:.1f}%** |")
    markdown_output.append("\n")

    # Expandable Details: Appium
    markdown_output.append("### 🔍 Appium Mobile Test Cases Detail Breakdowns")
    markdown_output.append(f"<details><summary>Click to view all Appium Mobile Test Cases ({len(appium_details)} tests)</summary>\n")
    markdown_output.append("| ID | Module | Test Case | Status | Remarks |")
    markdown_output.append("|---|---|---|---|---|")
    for r in appium_details:
        no = get_detail_val(r, ['Test Case ID', 'No.', '#', 'ID'])
        category = get_detail_val(r, ['Module', 'Category'])
        test_name = get_detail_val(r, ['Test Case', 'Test Name', 'Test Case Name'])
        status = str(get_detail_val(r, ['Status', 'Result'])).upper()
        status_emoji = "✅ PASSED" if "PASS" in status or status == "OK" else "❌ FAILED"
        remarks = get_detail_val(r, ['Remarks', 'Remarks / Error', 'Error Log'], '-')
        markdown_output.append(f"| {no} | {category} | `{test_name}` | {status_emoji} | {remarks} |")
    markdown_output.append("\n</details>\n")
    
    markdown_output.append("## 📥 Downloadable Test Report Artifacts")
    markdown_output.append("The full Excel spreadsheets (`.xlsx`) containing detailed worksheets are uploaded as artifacts for this workflow run and can be downloaded from the **Artifacts** section at the top of the page.")
    
    full_markdown = "\n".join(markdown_output)
    
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_file:
        with open(summary_file, "w", encoding="utf-8") as f:
            f.write(full_markdown)
        print("Successfully published E2E results to GitHub Step Summary!")
    else:
        print(full_markdown)

if __name__ == "__main__":
    main()

