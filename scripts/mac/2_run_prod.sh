#!/bin/bash
echo "Menjalankan aplikasi Lucky Draw di Production Mode..."

if [ -z "$NVM_DIR" ]; then
    export NVM_DIR="$HOME/.nvm"
fi
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

echo "Mengunduh module (npm install)..."
npm install

echo "Menyiapkan Prisma Database..."
npx prisma generate

echo "Membangun aplikasi (npm run build)..."
npm run build

echo "Menjalankan aplikasi di background dengan PM2..."
pm2 start npm --name "lucky-draw" -- run start
pm2 save

echo ""
echo "=========================================================="
echo "Aplikasi BERHASIL berjalan di latar belakang!"
echo "Silakan buka browser dan akses: http://localhost:3000"
echo "Anda bisa menutup jendela terminal ini dengan aman."
echo "=========================================================="
