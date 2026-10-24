@echo off
title Push Kekulawala ERP to GitHub
echo =========================================================
echo    KEKULAWALA UNIFIED ENTERPRISE ERP - GIT PUSH
echo    Target: git@github.com:cmsys-v2/kekulawala-ERP.git
echo =========================================================
echo.

git status
echo.
echo Pushing branch 'main' to origin...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ---------------------------------------------------------
    echo Push encountered an issue.
    echo Ensure GitHub CLI is logged in as 'cmsys-v2':
    echo   run: gh auth login
    echo ---------------------------------------------------------
) else (
    echo.
    echo =========================================================
    echo [SUCCESS] Codebase successfully pushed to GitHub!
    echo =========================================================
)

pause
