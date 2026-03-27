# Vested — Crypto Trading & Copy-Trading Platform

  A full-featured crypto trading platform with dual dashboards built with **React + Vite + TypeScript + Supabase**.

  ## Features

  - **Landing Page** — marketing page with pricing, features, and CTA
  - **User Dashboard**
    - Portfolio overview with live chart
    - Market data (prices, 24h change)
    - Deposit & withdrawal management
    - Copy trading (subscribe to top traders)
    - Profile & security settings
  - **Super Admin Dashboard**
    - User management (view, approve, suspend)
    - Crypto asset management
    - Trader management
    - Transaction approval/rejection
    - Email template editor
    - Platform settings
    - Audit logs

  ---

  ## Tech Stack

  | Layer | Technology |
  |-------|-----------|
  | Frontend | React 19, Vite 7, TypeScript |
  | Styling | Tailwind CSS, shadcn/ui |
  | Backend/DB | Supabase (PostgreSQL + Auth + Realtime) |
  | Animations | Framer Motion |
  | Charts | Recharts |
  | Icons | Lucide React |

  ---

  ## Getting Started

  ### Prerequisites

  - Node.js 18+ and npm
  - A [Supabase](https://supabase.com) account (free tier works)

  ### 1. Clone the Repository

  ```bash
  git clone https://github.com/mandelahgbera-afk/vested-crypto-platform.git
  cd vested-crypto-platform
  ```

  ### 2. Install Dependencies

  ```bash
  npm install
  ```

  ### 3. Set Up Supabase

  1. Go to [supabase.com](https://supabase.com) and create a new project
  2. Wait for the project to be ready (~2 minutes)
  3. Go to **Settings → API** in your Supabase dashboard
  4. Copy your **Project URL** and **anon/public key**

  ### 4. Configure Environment Variables

  Copy the example env file and fill in your credentials:

  ```bash
  cp .env.example .env
  ```

  The `.env.example` file already contains the correct values for this Supabase project. If you're using a different Supabase project, update them with your own values.

  Your `.env` file should look like:

  ```env
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key-here
  ```

  ### 5. Set Up the Database

  1. In your Supabase project, go to **SQL Editor** (left sidebar)
  2. Click **New Query**
  3. Open the `schema.sql` file from this repo and paste its entire contents
  4. Click **Run** (or press Ctrl+Enter)

  This creates all 13 tables, RLS security policies, database triggers, indexes, and seeds initial data (cryptos, traders, email templates, admin account).

  ### 6. Run the Development Server

  ```bash
  npm run dev
  ```

  Open [http://localhost:5173](http://localhost:5173) in your browser.

  ---

  ## Default Admin Credentials

  | Field | Value |
  |-------|-------|
  | Username | `admin` |
  | Password | `VestedAdmin2024!` |

  > **Important:** Change the admin password immediately after first login via **Admin Dashboard → Settings → Change Password**

  To access the admin dashboard, go to `/admin` or click the Admin Login link on the landing page.

  ---

  ## Project Structure

  ```
  vested-crypto-platform/
  ├── public/                  # Static assets (favicon, opengraph image)
  ├── schema.sql               # Full Supabase database setup script
  ├── src/
  │   ├── components/          # Reusable UI components
  │   │   └── ui/              # shadcn/ui component library
  │   ├── contexts/            # React context providers (Auth, etc.)
  │   ├── hooks/               # Custom React hooks
  │   ├── lib/
  │   │   ├── supabase.ts      # Supabase client + all DB operations
  │   │   ├── admin-operations.ts  # Admin-specific DB operations
  │   │   └── copytrading.ts   # Copy trading logic
  │   ├── pages/               # Page-level components
  │   │   ├── LandingPage.tsx
  │   │   ├── Dashboard.tsx    # User dashboard
  │   │   └── AdminDashboard.tsx
  │   ├── sections/            # Landing page sections
  │   ├── types/               # TypeScript type definitions
  │   ├── App.tsx              # Root component + routing
  │   └── main.tsx             # Entry point
  ├── .env.example             # Environment variable template
  ├── package.json
  ├── tailwind.config.js
  ├── tsconfig.json
  └── vite.config.ts
  ```

  ---

  ## Database Schema

  | Table | Description |
  |-------|-------------|
  | `users` | Platform users (linked to Supabase Auth) |
  | `super_admin` | Admin accounts |
  | `cryptos` | Supported cryptocurrency assets |
  | `traders` | Copy traders with performance stats |
  | `transactions` | Deposits & withdrawals (with approval flow) |
  | `user_cryptos` | User portfolio holdings |
  | `user_chart_data` | Portfolio value history for charts |
  | `activity_logs` | User activity feed |
  | `admin_settings` | Platform-wide configuration key/value store |
  | `user_traders` | Copy-trading subscriptions (user → trader) |
  | `email_templates` | Customizable transactional email templates |
  | `email_logs` | Record of all sent emails |
  | `audit_logs` | Admin action audit trail |

  ---

  ## Deploying to Vercel

  1. Push your code to GitHub (already done!)
  2. Go to [vercel.com](https://vercel.com) and click **Add New Project**
  3. Import the `vested-crypto-platform` repository
  4. Under **Environment Variables**, add:
     - `VITE_SUPABASE_URL` = your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
  5. Click **Deploy**

  Your app will be live at `https://your-project.vercel.app`

  ---

  ## Deploying to Netlify

  1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
  2. Select your GitHub repo
  3. Set build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
  4. Add environment variables (same as above)
  5. Click **Deploy site**

  ---

  ## Local Build for Production

  ```bash
  npm run build
  ```

  Output will be in the `dist/` folder. You can preview it locally with:

  ```bash
  npm run preview
  ```

  ---

  ## Troubleshooting

  **App shows blank page / auth errors**
  - Make sure your `.env` file exists and has the correct Supabase URL and anon key
  - Confirm the database schema has been run in Supabase SQL Editor

  **Admin login not working**
  - Ensure you ran `schema.sql` — it inserts the default admin account
  - Default credentials: `admin` / `VestedAdmin2024!`

  **Email verification not working**
  - Go to Supabase Dashboard → **Authentication → Email Templates** to configure email settings
  - For testing, you can disable email confirmation under **Authentication → Providers → Email**
  