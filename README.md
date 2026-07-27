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

## Initialization & Setup (Running Locally)

Follow these steps to initialize and run the project on your local machine.

### Prerequisites (Infrastructure)

1. **Node.js**: Ensure you have Node.js installed (version 18.17 or higher recommended). You can download it from [nodejs.org](https://nodejs.org/).
2. **Database**: **None required!** This application uses your browser's built-in **IndexedDB**. There is no need to install PostgreSQL, MySQL, or MongoDB.
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

3. **Start the development server**:
   ```bash
   npm run dev
   ```

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
