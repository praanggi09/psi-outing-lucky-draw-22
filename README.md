# Office Anniversary Lucky Draw

A modern, elegant, and interactive Lucky Draw application built with Next.js, Tailwind CSS, Framer Motion, and Shadcn UI. 

This application was designed specifically for office anniversaries or company events. It features a stunning drawing interface and a comprehensive admin dashboard to manage participants, prizes, and winner history.

## ⚠️ Important Note on Data Storage

This application operates **entirely in your browser** and uses **IndexedDB** for storage. There is no external backend or database. 
- All data (Participants, Prizes, and Winners) is saved locally to the browser where you open the app.
- If you deploy the app to the internet (e.g., via Vercel) and open it on your laptop, the data stays on your laptop. If someone else opens the link on their phone, they will see an empty database.
- This architecture is perfect for event operators who manage the draw from a single laptop connected to a projector, guaranteeing fast performance and zero server costs!

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

## Running Locally

If you just want to run it locally on your machine without deploying:

First, install dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Go to `http://localhost:3000/admin` to set up your prizes and participants!
