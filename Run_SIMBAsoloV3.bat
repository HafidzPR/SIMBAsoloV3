@echo off
chcp 65001 >nul
cls

:: Enable ANSI Virtual Terminal Escape Sequences
for /F %%A in ('echo prompt $E ^| cmd') do set "ESC=%%A"

TITLE SIMBAsoloV3_Controller
cls

echo %ESC%[96m========================================================================================
echo   ███████╗██╗███╗    ███╗██████╗  █████╗ solo   ██╗   ██╗██████╗ 
echo   ██╔════╝██║████╗ ████║██╔══██╗██╔══██╗       ██║   ██║╚════██╗
echo   ███████╗██║██╔████╔██║██████╔╝███████║       ██║   ██║ █████╔╝
echo   ╚════██║██║██║╚██╔╝██║██╔══██╗██╔══██║       ╚██╗ ██╔╝ ╚═══██╗
echo   ███████║██║██║ ╚═╝ ██║██████╔╝██║  ██║        ╚████╔╝ ██████╔╝
echo   ╚══════╝╚═╝╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝         ╚═══╝  ╚═════╝ 
echo ========================================================================================%ESC%[0m
echo.
echo   %ESC%[93m[DEVELOPER INFORMATION]%ESC%[0m
echo   [-] Nama              : Hafidz Putra Rachman
echo   [-] Capstone/TA       : Sistem Penerjemah Gerakan Bahasa Isyarat ke kata-kata Teks
echo   [-] Arsitektur / Tech : Jaringan Saraf Konvolusional (CNN) - MobileNet berbasis Python
echo.
echo   %ESC%[96m[SYSTEM INITIALIZATION] Launching core services...%ESC%[0m
echo.

:: ── SERVICE INVOCATION ───────────────────────────────────────────────

echo  %ESC%[94m[STARTING] Launching ML Service...%ESC%[0m
start "SIMBA_ML" cmd /k "title SIMBA_ML && call C:\Users\hafid\anaconda3\Scripts\activate.bat simba_v3 && cd /d C:\CAPSTONE_Codes\SIMBAsoloV3\ml-service && uvicorn main:app --port 8001 --reload"

echo  %ESC%[94m[STARTING] Launching Backend...%ESC%[0m
start "SIMBA_BACKEND" cmd /k "title SIMBA_BACKEND && call C:\Users\hafid\anaconda3\Scripts\activate.bat simba_v3 && cd /d C:\CAPSTONE_Codes\SIMBAsoloV3 && uvicorn backend.main:app --port 8000 --reload"

echo  %ESC%[94m[STARTING] Launching Frontend...%ESC%[0m
start "SIMBA_FRONTEND" cmd /k "title SIMBA_FRONTEND && cd /d C:\CAPSTONE_Codes\SIMBAsoloV3\frontend && npm run dev"

:: Wait & Browser Launch
echo.
echo  %ESC%[96m[WAIT] Loading application components (15s)...%ESC%[0m
timeout /t 15 /nobreak >nul

echo.
echo  %ESC%[92m[->] Opening Web Interface...%ESC%[0m
start http://localhost:5173

echo.
echo %ESC%[96m========================================================================================%ESC%[0m
echo   %ESC%[92m[SUCCESS] SIMBAsoloV3 ACTIVE%ESC%[0m
echo %ESC%[96m========================================================================================%ESC%[0m
echo.  
echo   %ESC%[93mPress ANY KEY to kill the processes and exit this window.%ESC%[0m
echo %ESC%[96m========================================================================================%ESC%[0m

pause >nul

echo.
echo  %ESC%[91m[SHUTDOWN] Force terminating service windows...%ESC%[0m

taskkill /F /FI "WINDOWTITLE eq SIMBA_ML*" /IM cmd.exe /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq SIMBA_BACKEND*" /IM cmd.exe /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq SIMBA_FRONTEND*" /IM cmd.exe /T >nul 2>&1

exit