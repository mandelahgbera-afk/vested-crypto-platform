# Vested — Crypto Trading & Copy-Trading Platform

A full-featured crypto trading platform with dual dashboards built with React + Vite + Supabase.

## Features

- **Landing Page** — marketing page with pricing and features
- **User Dashboard** — portfolio management, market data, deposits/withdrawals, copy trading, profile settings
- **Super Admin Dashboard** — full platform control: users, cryptos, traders, transactions, settings, email templates, audit logs

## Tech Stack

- React 19 + Vite 7 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth + Realtime)
- Framer Motion animations
- Recharts for portfolio charts

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up the database

In your Supabase project, go to **SQL Editor → New Query**, paste the contents of `schema.sql`, and run it. This creates all 13 tables, RLS policies, triggers, indexes, and seed data.

### 4. Run the app

```bash
npm run dev
```

## Default Admin Credentials

- **Username:** `admin`
- **Password:** `VestedAdmin2024!`

> Change these immediately after first login via Admin → Settings.

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Deploy

## Database Tables

| Table | Description |
|-------|-------------|
| `users` | Platform users |
| `super_admin` | Admin accounts |
| `cryptos` | Supported cryptocurrencies |
| `traders` | Copy traders |
| `transactions` | Deposits & withdrawals |
| `user_cryptos` | User portfolio holdings |
| `user_chart_data` | Portfolio history |
| `activity_logs` | User activity feed |
| `admin_settings` | Platform configuration |
| `user_traders` | Copy-trading subscriptions |
| `email_templates` | Customizable email templates |
| `email_logs` | Sent email history |
| `audit_logs` | Admin audit trail |
