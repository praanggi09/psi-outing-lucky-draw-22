#!/bin/bash
echo "Menyiapkan infrastruktur untuk Lucky Draw (Mac/Linux)..."

# Cek apakah NVM sudah terinstall
if [ -z "$NVM_DIR" ]; then
    export NVM_DIR="$HOME/.nvm"
fi

if [ -s "$NVM_DIR/nvm.sh" ]; then
    echo "NVM sudah terinstall."
    \. "$NVM_DIR/nvm.sh"
else
    echo "Menginstall NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    \. "$NVM_DIR/nvm.sh"
fi

echo "Menginstall Node.js versi 20..."
nvm install 20
nvm use 20

echo "Menginstall PM2 (Process Manager)..."
npm install -g pm2

echo "Infrastruktur siap! Silakan jalankan 2_run_prod.sh selanjutnya."
