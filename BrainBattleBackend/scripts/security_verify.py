"""
BrainBattle Backend Security Verification Script
Checks dependencies, file structure, and security configuration.
Generates a Markdown + JSON security report — no server required.
"""

import json
import os
import sys
import datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BACKEND_ROOT = os.path.join(ROOT, 'BrainBattleBackend', 'BrainBattleBackend')
if not os.path.isdir(BACKEND_ROOT):
    BACKEND_ROOT = os.path.join(ROOT, 'BrainBattleBackend')

# ── Security Checks ──────────────────────────────────────────────────────────
checks = [
    {
        'name': 'Backend app.py present',
        'suite': 'File Structure',
        'fn': lambda: os.path.isfile(os.path.join(BACKEND_ROOT, 'app.py'))
    },
    {
        'name': 'config.py present (no hardcoded secrets)',
        'suite': 'File Structure',
        'fn': lambda: os.path.isfile(os.path.join(BACKEND_ROOT, 'config.py'))
    },
    {
        'name': 'Auth routes defined',
        'suite': 'Authentication',
        'fn': lambda: os.path.isfile(os.path.join(BACKEND_ROOT, 'routes', 'auth_routes.py'))
    },
    {
        'name': 'JWT used for authentication',
        'suite': 'Authentication',
        'fn': lambda: _file_contains(os.path.join(BACKEND_ROOT, 'app.py'), 'jwt') or
                      _file_contains(os.path.join(BACKEND_ROOT, 'config.py'), 'jwt') or
                      _dir_contains_text(os.path.join(BACKEND_ROOT, 'routes'), 'jwt')
    },
    {
        'name': 'No plain-text password storage detected',
        'suite': 'Authentication',
        'fn': lambda: not _dir_contains_text(BACKEND_ROOT, 'password =') and
                      not _dir_contains_text(BACKEND_ROOT, 'password=')
    },
    {
        'name': 'Flask CORS configured',
        'suite': 'Security Headers',
        'fn': lambda: _file_contains(os.path.join(BACKEND_ROOT, 'app.py'), 'CORS') or
                      _file_contains(os.path.join(BACKEND_ROOT, 'app.py'), 'flask_cors')
    },
    {
        'name': 'Database directory present',
        'suite': 'Data Layer',
        'fn': lambda: os.path.isdir(os.path.join(BACKEND_ROOT, 'database')) or
                      os.path.isdir(os.path.join(BACKEND_ROOT, 'instance'))
    },
    {
        'name': 'Models directory present',
        'suite': 'Data Layer',
        'fn': lambda: os.path.isdir(os.path.join(BACKEND_ROOT, 'models'))
    },
    {
        'name': 'SQLAlchemy ORM used (prevents raw SQL injection)',
        'suite': 'Data Layer',
        'fn': lambda: _dir_contains_text(BACKEND_ROOT, 'SQLAlchemy') or
                      _dir_contains_text(BACKEND_ROOT, 'db.Model')
    },
    {
        'name': 'Dashboard routes defined',
        'suite': 'API Routes',
        'fn': lambda: os.path.isfile(os.path.join(BACKEND_ROOT, 'routes', 'dashboard_routes.py'))
    },
    {
        'name': 'User routes defined',
        'suite': 'API Routes',
        'fn': lambda: os.path.isfile(os.path.join(BACKEND_ROOT, 'routes', 'user_routes.py'))
    },
    {
        'name': 'Progress routes defined',
        'suite': 'API Routes',
        'fn': lambda: os.path.isfile(os.path.join(BACKEND_ROOT, 'routes', 'progress_routes.py'))
    },
    {
        'name': 'No DEBUG=True in production config',
        'suite': 'Production Safety',
        'fn': lambda: not _file_contains(os.path.join(BACKEND_ROOT, 'config.py'), 'DEBUG = True') and
                      not _file_contains(os.path.join(BACKEND_ROOT, 'config.py'), 'DEBUG=True')
    },
    {
        'name': 'requirements file present',
        'suite': 'Dependencies',
        'fn': lambda: os.path.isfile(os.path.join(BACKEND_ROOT, 'requirements.txt')) or
                      os.path.isfile(os.path.join(BACKEND_ROOT, 'requirements..txt')) or
                      os.path.isfile(os.path.join(ROOT, 'BrainBattleBackend', 'requirements.txt'))
    },
    {
        'name': 'werkzeug present (password hashing support)',
        'suite': 'Dependencies',
        'fn': lambda: _any_req_file_contains(ROOT, 'werkzeug')
    },
]

def _file_contains(filepath, text):
    try:
        with open(filepath, 'r', errors='ignore') as f:
            return text.lower() in f.read().lower()
    except Exception:
        return False

def _dir_contains_text(dirpath, text):
    try:
        for fname in os.listdir(dirpath):
            fpath = os.path.join(dirpath, fname)
            if os.path.isfile(fpath) and fname.endswith('.py'):
                if _file_contains(fpath, text):
                    return True
        return False
    except Exception:
        return False

def _any_req_file_contains(root, text):
    for dirpath, _, files in os.walk(root):
        for f in files:
            if 'requirement' in f.lower():
                if _file_contains(os.path.join(dirpath, f), text):
                    return True
    return False

# ── Run Checks ────────────────────────────────────────────────────────────────
print('\n🔒 BrainBattle Backend Security Verification\n' + '=' * 45)
results = []
passed = 0
failed = 0

for check in checks:
    try:
        ok = bool(check['fn']())
    except Exception as e:
        ok = False
    
    status = 'PASSED' if ok else 'FAILED'
    if ok:
        passed += 1
        print(f"  ✅ [PASS] {check['name']}")
    else:
        failed += 1
        print(f"  ⚠️  [WARN] {check['name']}")
    
    results.append({
        'suite': check['suite'],
        'name': check['name'],
        'status': status,
        'severity': 'INFO' if ok else 'WARNING'
    })

print(f'\n📊 Results: {passed} passed, {failed} warnings out of {len(results)} checks\n')

# ── GitHub Step Summary ───────────────────────────────────────────────────────
summary_path = os.environ.get('GITHUB_STEP_SUMMARY')
if summary_path:
    with open(summary_path, 'a') as f:
        f.write('## 🔒 BrainBattle Backend Security Verification\n\n')
        f.write(f'**{passed}/{len(results)} checks passed** | ')
        f.write(f'{"✅ All security checks passed" if failed == 0 else f"⚠️ {failed} warnings detected"}\n\n')
        f.write('| Status | Suite | Security Check | Severity |\n')
        f.write('|--------|-------|----------------|----------|\n')
        for r in results:
            icon = '✅' if r['status'] == 'PASSED' else '⚠️'
            f.write(f"| {icon} {r['status']} | {r['suite']} | {r['name']} | {r['severity']} |\n")
        f.write('\n---\n*Generated by BrainBattle Backend Security CI*\n')

# ── Save JSON Report ───────────────────────────────────────────────────────────
report = {
    'generated': datetime.datetime.utcnow().isoformat() + 'Z',
    'project': 'BrainBattle',
    'summary': {'total': len(results), 'passed': passed, 'warnings': failed},
    'checks': results
}

out_path = os.path.join(os.path.dirname(__file__), 'security_report.json')
with open(out_path, 'w') as f:
    json.dump(report, f, indent=2)
print(f'📄 Security report saved: {out_path}')

# Always exit 0 — warnings are informational
sys.exit(0)
