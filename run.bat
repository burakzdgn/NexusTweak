@echo off
title NexusTweak Starter
echo ========================================================
echo   NexusTweak - Android ADB Optimizer & Manager
echo ========================================================
echo.

if not exist node_modules (
    echo [*] Installing NPM dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [!] Failed to install npm dependencies.
        pause
        exit /b %errorlevel%
    )
)

echo [*] Starting NexusTweak Desktop Application...
call npm run tauri dev
if %errorlevel% neq 0 (
    echo.
    echo [!] Application failed to start.
    echo [*] If Rust is missing, please install Rust from: https://rustup.rs
    pause
)
