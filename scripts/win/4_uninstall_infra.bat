@echo off
echo Menghapus instalasi infrastruktur...

echo.
echo Mematikan semua proses PM2...
call pm2 kill

echo.
echo Menghapus folder cache node_modules dan .next...
rmdir /S /Q node_modules
rmdir /S /Q .next

echo.
echo Menghapus instalasi Node.js...
if exist node-v20.msi (
    msiexec.exe /x node-v20.msi /quiet /norestart
    del node-v20.msi
) ELSE (
    echo File installer node-v20.msi tidak ditemukan. Jika Node.js masih ada, silakan hapus manual dari Control Panel.
)

echo.
echo Infrastruktur berhasil dihapus dari laptop ini.
pause
