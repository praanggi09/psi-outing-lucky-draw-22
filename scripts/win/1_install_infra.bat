@echo off
echo Menyiapkan infrastruktur untuk Lucky Draw (Windows)...
echo.

:: Cek apakah node.js sudah terinstall
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Node.js belum terinstall. Mendownload Node.js v20...
    curl -o node-v20.msi https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi
    
    echo Menginstall Node.js... (Silakan tunggu, mungkin memakan waktu 1-2 menit)
    msiexec.exe /i node-v20.msi /quiet /norestart
    
    echo Node.js berhasil diinstall! 
    echo PENTING: Anda harus MENUTUP jendela CMD ini dan membuka jendela CMD baru agar Node.js bisa mendeteksi path dengan benar.
    echo Buka CMD baru, navigasi ke folder ini, dan jalankan ulang script ini untuk menginstall PM2.
    pause
    exit /b
) ELSE (
    echo Node.js sudah terinstall.
)

echo.
echo Menginstall PM2 (Process Manager)...
call npm install -g pm2

echo.
echo Infrastruktur siap! Silakan jalankan 2_run_prod.bat selanjutnya.
pause
