@echo off
echo Mematikan aplikasi Lucky Draw...

call pm2 stop lucky-draw
call pm2 delete lucky-draw
call pm2 save --force

echo Aplikasi berhasil dimatikan.
pause
