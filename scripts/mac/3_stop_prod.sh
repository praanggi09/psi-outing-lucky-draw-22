#!/bin/bash
echo "Mematikan aplikasi Lucky Draw..."

if [ -z "$NVM_DIR" ]; then
    export NVM_DIR="$HOME/.nvm"
fi
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

pm2 stop lucky-draw
pm2 delete lucky-draw
pm2 save --force

echo "Aplikasi berhasil dimatikan."
