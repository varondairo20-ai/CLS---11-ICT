@echo off
REM CLS Monitor - Quick Setup & Test Script

echo.
echo ============================================
echo    CLS Monitor - Setup & Network Test
echo ============================================
echo.

REM Show system IP addresses
echo [*] Your Server IP Addresses:
ipconfig | findstr /R "IPv4 Address"

echo.
echo [*] Network Configuration:
echo     PORT: 3000
echo     HOST: 0.0.0.0 (listen on all interfaces)
echo.

REM Check if Node.js is installed
echo [*] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js is installed
    node --version
) else (
    echo [ERROR] Node.js not found. Install from https://nodejs.org/
    exit /b 1
)

echo.
echo [*] Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] npm is installed
    npm --version
) else (
    echo [ERROR] npm not found
    exit /b 1
)

echo.
echo [*] Installing/updating dependencies...
call npm install

echo.
echo ============================================
echo    Firewall Configuration
echo ============================================
echo.
echo To allow network access, run PowerShell as Administrator and execute:
echo.
echo   New-NetFirewallRule -DisplayName 'CLS Monitor 3000' ^
echo     -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
echo.

echo ============================================
echo    Test Accounts
echo ============================================
echo.
echo Teacher Login:
echo   Username: teacher_01
echo   Password: password123
echo.
echo Student Login:
echo   Username: student_01 (or student_02)
echo   Password: password123
echo.

echo ============================================
echo    Starting Server...
echo ============================================
echo.

REM Start the server
call npm start

pause
