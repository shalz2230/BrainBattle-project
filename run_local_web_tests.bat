@echo off
echo =======================================================
echo    BrainBattle Local Web E2E Test Runner
echo =======================================================

echo [1/3] Starting Flask Backend Server...
cd BrainBattleBackend
start /B "FlaskServer" cmd /c "python app.py"
cd ..

echo Waiting 5 seconds for backend to start...
timeout /t 5 >nul

echo [2/3] Starting Vite Frontend Server...
cd BrainBattleWeb
start /B "ViteServer" cmd /c "npx vite preview --host 127.0.0.1 --port 5173 --base /"
cd ..

echo Waiting 5 seconds for frontend to start...
timeout /t 5 >nul

echo [3/3] Running Full Web Selenium Suite...
cd BrainBattleE2E
call npx mocha tests/mega_web_1100.test.js --timeout 300000 --reporter ./utils/excelReporter.js
cd ..

echo =======================================================
echo Tests completed! Cleaning up background servers...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo Done! Check BrainBattleE2E/selenium-report.xlsx for results.
pause
