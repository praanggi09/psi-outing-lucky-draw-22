# Office Anniversary Lucky Draw

A modern, elegant, and interactive Lucky Draw application built with Next.js, Tailwind CSS, Framer Motion, and Shadcn UI. 

This application was designed specifically for office anniversaries or company events. It features a stunning drawing interface and a comprehensive admin dashboard to manage participants, prizes, and winner history.

## ⚠️ Architecture Update

This application has been upgraded to use a real centralized Database (**PostgreSQL**) via **Prisma ORM**. 
- Your data is safely stored in the cloud (e.g., Vercel Postgres / Neon) and synced across all devices.
- It leverages Next.js Server Actions for seamless client-to-database communication.

## Features

- **Drawing Page (`/`)**: A highly polished, suspenseful shuffle animation with a cinematic dark & gold theme. Supports Redraws and Confirmations for Grand Prizes.
- **Admin Dashboard (`/admin`)**: A Shadcn UI powered dashboard to manage everything.
  - **Participants**: Upload participants instantly via CSV file.
  - **Prizes**: Add, edit, and delete prize names and quantities.
  - **Winners**: View winner history, export as CSV, or clear the history.

## How to Deploy (Highly Recommended: Vercel)

Since this is a Next.js application, the easiest and best platform to deploy is **Vercel** (it's completely free and requires zero configuration).

### Step-by-Step Vercel Deployment:
1. **Push to GitHub**: Upload this project repository to your GitHub account.
2. **Login to Vercel**: Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
3. **Import Project**: Click "Add New..." -> "Project", and select your GitHub repository from the list.
4. **Deploy**: Click the "Deploy" button. Vercel will automatically detect that it's a Next.js app and handle all the build settings.
5. **Done!**: Once finished (usually under 2 minutes), Vercel will give you a live URL (e.g., `https://your-lucky-draw.vercel.app`).

You can now use that URL on the main laptop you will be using for the event!

## Initialization & Setup (Running Locally)

Follow these steps to initialize and run the project on your local machine.

### Prerequisites (Infrastructure)

1. **Node.js**: Ensure you have Node.js installed (version 20.19 or higher required for Prisma 7).
2. **Database**: You need a PostgreSQL database (e.g., Vercel Postgres, Neon, or Supabase).
3. **Git**: (Optional but recommended) To clone the repository.

### Initial Setup Steps

1. **Clone the repository** (or download the source code):
   ```bash
   git clone https://github.com/your-username/psi-outing-lucky-draw-22.git
   cd psi-outing-lucky-draw-22
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Database**:
   - Create a `.env` file in the root folder.
   - Add your connection string: `DATABASE_URL="postgresql://user:password@host/dbname"`
   - Push the schema to your database:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **View your Database (Prisma Studio)**:
   You can visually inspect and manage your raw database records by running:
   ```bash
   npx prisma studio
   ```
   This will open a GUI in your browser at [http://localhost:5555](http://localhost:5555).

4. **Initialize Data**:
   - Open your browser and go to [http://localhost:3000/admin](http://localhost:3000/admin)
   - Go to the **Participants** tab and upload your CSV file containing the list of names.
   - Go to the **Prizes** tab and add the prizes (e.g., Doorprize or Grand Prize) and their quantities.
   - Now, you can open [http://localhost:3000](http://localhost:3000) to start drawing!

## Running in Production (Locally or Custom Server)

If you are not deploying to Vercel and want to run the optimized production build on your own machine or server, use the following commands:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm run start
   ```

The application will be running at [http://localhost:3000](http://localhost:3000) in production mode.

## Operator / D-Day Installation Guide

Untuk mempermudah panitia (operator) menjalankan aplikasi ini di laptop baru (baik Mac maupun Windows) secara offline/lokal pada Hari H, silakan ikuti panduan berikut:

### Persiapan Awal
1. Download/Clone repository ini ke laptop operator.
2. Minta file `.env` dari developer (yang berisi koneksi ke database Supabase) dan letakkan di dalam folder `lucky-draw` ini.

### Untuk Laptop Windows
Buka folder `scripts/win` dan klik dua kali (jalankan) file-file berikut secara berurutan:
1. **`1_install_infra.bat`**: Menginstall Node.js secara otomatis. *(Penting: Setelah selesai, tutup jendela CMD, lalu buka CMD baru sebelum lanjut ke nomor 2)*.
2. **`2_run_prod.bat`**: Akan mengunduh paket, membangun aplikasi, dan menyalakannya di latar belakang. Jika sudah muncul tulisan BERHASIL, Anda bisa menutup jendela terminal hitam tersebut. Aplikasi bisa diakses di `http://localhost:3000`.
3. **`3_stop_prod.bat`**: Gunakan script ini jika acara sudah selesai untuk mematikan aplikasi.
4. **`4_uninstall_infra.bat`**: Menghapus seluruh instalasi aplikasi dan Node.js agar laptop operator bersih kembali.

### Untuk Laptop Mac / Linux
Buka Terminal, masuk ke folder `lucky-draw/scripts/mac`, lalu jalankan secara berurutan:
1. `./1_install_infra.sh`
2. `./2_run_prod.sh` (Aplikasi akan berjalan di background, akses di `http://localhost:3000`)
3. `./3_stop_prod.sh` (Untuk mematikan saat acara selesai)
4. `./4_uninstall_infra.sh` (Untuk membersihkan instalasi)
