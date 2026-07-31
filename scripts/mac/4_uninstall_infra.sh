#!/bin/bash
echo "Menghapus instalasi infrastruktur..."

echo "Mematikan semua proses PM2..."
if [ -z "$NVM_DIR" ]; then
    export NVM_DIR="$HOME/.nvm"
fi
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
pm2 kill

echo "Menghapus folder cache node_modules dan .next..."
rm -rf node_modules
rm -rf .next

echo "Menghapus instalasi NVM dan Node.js..."
rm -rf "$HOME/.nvm"
rm -rf "$HOME/.npm"
rm -rf "$HOME/.pm2"

# Hapus baris nvm dari ~/.bashrc atau ~/.zshrc jika ada (opsional, untuk kebersihan penuh)

echo "Infrastruktur berhasil dihapus dari laptop ini."
