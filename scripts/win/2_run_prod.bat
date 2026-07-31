@echo off
echo Menjalankan aplikasi Lucky Draw di Production Mode...
echo.

echo Mengunduh module (npm install)...
call npm install

echo.
echo Menyiapkan Prisma Database...
call npx prisma generate

echo.
echo Membangun aplikasi (npm run build)...
call npm run build

echo.
echo Menjalankan aplikasi di background dengan PM2...
call pm2 start npm --name "lucky-draw" -- run start
call pm2 save

echo.
echo ==========================================================
echo Aplikasi BERHASIL berjalan di latar belakang!
echo Silakan buka browser dan akses: http://localhost:3000
echo Anda bisa menutup jendela terminal ini dengan aman.
echo ==========================================================
pause
