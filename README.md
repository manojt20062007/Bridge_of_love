# Bridge Of Love — Charitable Trust Management Platform

> **“Connecting compassionate hearts with people in need.”**

Bridge Of Love is a production-ready, full-stack PERN (PostgreSQL, Express, React, Node.js) platform built with a modern monorepo architecture. It features a public-facing editorial website, a private member portal for donors, and a comprehensive administration dashboard for trust operational governance.

---

## Architecture Overview

```text
bridge-of-love/
├── apps/
│   ├── web/                    # Unified React 18 + Vite Frontend (Public, Member, Admin)
│   │   ├── src/
│   │   │   ├── components/     # Custom theme UI & Layouts
│   │   │   ├── context/        # Auth & Universal Donation Modal
│   │   │   ├── pages/
│   │   │   │   ├── public/     # Home, About, Mission, Causes, Transparency, Gallery, Contact, Verify
│   │   │   │   ├── member/     # Dashboard, Donate, History, Receipts, Profile, Security
│   │   │   │   └── admin/      # Metrics, Members, Donations, Expenses, Income, Receipts, Reports, Content, Audit
│   │   │   └── lib/            # API client with JWT interceptor & utilities
│   │   └── Dockerfile          # Production Nginx image
│   │
│   └── api-server/             # Express.js + TypeScript + PostgreSQL API
│       ├── prisma/             # Schema (26 models), migrations & rich seed script
│       ├── src/
│       │   ├── config/         # Database, Environment, Winston logger
│       │   ├── controllers/    # Auth, Member, Donation, Admin, Campaign, Transparency, Content
│       │   ├── middleware/     # JWT Auth, RBAC, Rate Limiting, Error handling
│       │   ├── routes/         # REST API routes under /api/v1
│       │   └── services/       # PDFKit receipt generator, Razorpay, Ledger, Email, Audit
│       └── Dockerfile          # Multi-stage production container
│
├── packages/
│   ├── shared-types/           # Shared TypeScript interfaces
│   ├── validation/             # Zod validation schemas
│   └── ui-components/          # Brand design tokens, INR formatters, amountInWords
│
├── docker-compose.yml          # Full-stack container orchestration
├── .env.example                # Sample environment template
└── README.md
```

---

## Key Features

1. **Editorial Public Website (`/`)**
   - High-impact storytelling, real-world impact counters, and photographic documentation.
   - Active cause cards with real-time fundraising progress and 80G tax benefit highlights.
   - Public financial transparency dashboard with verified inflow/outflow charts.

2. **Member Portal (`/member`)**
   - Personal donor dashboard with lifetime impact totals and donation counts.
   - One-click online contributions via integrated payment modal.
   - Official 80G PDF receipt library with instant download and verification links.
   - Profile management and account security controls.

3. **Admin Dashboard (`/admin`)**
   - Comprehensive operational metrics: Active causes, verified donations, pending approvals.
   - Two-tier expense approval workflow (`PENDING_APPROVAL` -> `APPROVED` -> `PAID` with automatic ledger debit).
   - Offline donation recorder (cash, cheque, bank transfer) with sequential receipt generation.
   - Audit trail viewer tracking administrative logins, voucher approvals, and cancellations.
   - Financial report generator with CSV exports.

4. **Security & Financial Integrity**
   - Sequential, collision-safe 80G receipts (`BOL-YYYY-XXXXXX`).
   - Immutable double-entry financial ledger.
   - Public QR verification page (`/verify-receipt/:receiptNumber`) with masked donor PII.
   - Argon2/Bcrypt password hashing and JWT access/refresh token rotation.
   - Server-side cryptographic signature checks for Razorpay payments and webhooks.

---

## Quickstart & Local Development

### 1. Prerequisites
- **Node.js**: v18.0 or later (v20+ recommended)
- **PostgreSQL**: v14+ (Local service or cloud database such as Neon or Supabase)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` in the root directory and in `apps/api-server/.env`:
```bash
cp .env.example .env
cp .env.example apps/api-server/.env
```
Ensure your `DATABASE_URL` is set properly (e.g. `postgresql://postgres:password@localhost:5432/bridge_of_love?schema=public`).

### 4. Database Setup & Seeding
Push the Prisma schema to create all 26 models, relations, and indexes, then populate demo data:
```bash
# Push schema to PostgreSQL
npm run prisma:push --workspace=apps/api-server

# Seed with demonstration data
npm run prisma:seed --workspace=apps/api-server
```

### 5. Start the Development Servers
Start both backend API and frontend Vite dev servers concurrently:
```bash
npm run dev
```
- **Public Website & Portals**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

---

## Seed Accounts (Development)

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@bridgeoflove.org` | `Admin@BridgeOfLove2026!` |
| **Member Patron** | `member@example.com` | `Member@BridgeOfLove2026!` |

*(Note: The login page also contains one-click demo credentials fill buttons for instant testing).*

---

## Running Automated Tests

Run backend unit and integration tests using Vitest:
```bash
npm run test --workspace=apps/api-server
```

---

## Docker Deployment

To launch the complete application stack (PostgreSQL 17, Node API Server, and Nginx Web Frontend) in Docker containers:
```bash
docker-compose up --build
```
Access the application at [http://localhost:5173](http://localhost:5173).

---

## Production Deployment Guide

1. **Frontend (Vite / React)**:
   - Deployable on **Vercel**, **Netlify**, or **Cloudflare Pages**.
   - Build command: `npm run build --workspace=@bridge-of-love/web`
   - Output directory: `apps/web/dist`

2. **Backend API Server (Node / Express)**:
   - Deployable on **Render**, **Railway**, **Fly.io**, or **AWS ECS/EC2**.
   - Build command: `npm run build --workspace=@bridge-of-love/api-server`
   - Start command: `node apps/api-server/dist/index.js`

3. **Database (PostgreSQL)**:
   - Compatible with **Neon**, **Supabase PostgreSQL**, **Railway**, or **AWS RDS**.
   - Run migrations using: `npx prisma db push` or `npx prisma migrate deploy`.

---

## Replacing Trust Placeholder Information

To update legal registrations, bank accounts, or trust details in production:
1. Update the environment variables in `.env`:
   - `TRUST_NAME`
   - `TRUST_REG_NO`
   - `TRUST_PAN`
   - `TRUST_80G_REG`
   - `TRUST_ADDRESS`
   - `TRUST_PHONE`
   - `TRUST_EMAIL`
2. Alternatively, log in as an Administrator and navigate to **Trust Settings** (`/admin/settings`) to update values dynamically in the database.

---

## Database Backup & Recovery

### Backup
```bash
pg_dump -U postgres -d bridge_of_love -F c -b -v -f "bridge_of_love_backup_$(date +%Y%m%d).dump"
```

### Recovery
```bash
pg_restore -U postgres -d bridge_of_love -v "bridge_of_love_backup_YYYYMMDD.dump"
```
"# Bridge_of_love" 
