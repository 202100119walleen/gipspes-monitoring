@echo off
title DOLE GIP Monitoring System - Git Commit & Push Script
color 0A
echo ============================================================
echo      DOLE LDNPFO GIP MONITORING SYSTEM - AUTO COMMIT & PUSH
echo ============================================================
echo.

set GIT_PATH="D:\Git\cmd\git.exe"

if not exist %GIT_PATH% (
    set GIT_PATH=git
)

echo [1/4] Checking Git repository status...
%GIT_PATH% status
echo.

set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Update GIP Monitoring System - %date% %time%
)

echo.
echo [2/4] Staging updated files...
%GIT_PATH% add .

echo.
echo [3/4] Creating commit: "%COMMIT_MSG%"...
%GIT_PATH% commit -m "%COMMIT_MSG%"

echo.
echo [4/4] Pushing to GitHub (https://github.com/202100119walleen/gipspes)...
%GIT_PATH% push origin main

echo.
echo ============================================================
echo   SUCCESS! All changes committed & pushed to GitHub.
echo ============================================================
echo.
pause
