# 🚀 Bridge Of Love — 100% Free-of-Cost Production Deployment Guide

This guide walks you through deploying the complete **Bridge Of Love** charitable trust platform live to the internet with **₹0 ($0.00) monthly cost** using industry-standard generous free tiers.

---

## 🏛️ Free-Tier Architecture Overview

| Component | Free Provider | Free Tier Allowance | Real Monthly Cost |
| :--- | :--- | :--- | :--- |
| **PostgreSQL Database** | **[Neon.tech](https://neon.tech)** | 0.5 GB storage, autoscaling serverless, native connection pooling | **₹0 / $0** (Forever Free) |
| **Backend API Server** | **[Render.com](https://render.com)** | 750 free instance hours/month (24/7 runtime for 1 service), free SSL | **₹0 / $0** (Forever Free) |
| **Frontend Web App** | **[Vercel](https://vercel.com)** | Unlimited global CDN, automated deployments, custom domain SSL | **₹0 / $0** (Forever Free) |
| **Email Service (Receipts)** | **[Brevo](https://brevo.com)** or **Gmail SMTP** | 300 emails/day (9,000/mo) or 500 emails/day via Gmail App Password | **₹0 / $0** (Forever Free) |
| **Payment Gateway** | **[Razorpay](https://razorpay.com)** | Test mode unlimited, live mode has ₹0 setup & ₹0 monthly fee | **₹0 / $0** (Zero fixed cost) |
| **24/7 Keep-Alive Pinger** | **[Cron-job.org](https://cron-job.org)** | Free ping every 10 minutes to prevent Render free cold-starts | **₹0 / $0** (Forever Free) |

---

## 📋 Step-by-Step Deployment Roadmap

```mermaid
graph TD
    A[Step 1: Push Code to GitHub Repository] --> B[Step 2: Create Free Neon PostgreSQL Database]
    B --> C[Step 3: Deploy Backend API to Render]
    C --> D[Step 4: Seed Database with Admin & Initial Data]
    D --> E[Step 5: Deploy Frontend Web App to Vercel]
    E --> F[Step 6: Configure Keep-Alive Pinger & Domain]
    F --> G[🎉 Live Platform Ready for Public & Donors]
```

---

## Step 1: Push Codebase to GitHub (Private or Public)

1. Initialize Git in the project root (if not already done):
   ```bash
   git init
   git add .
   git commit -m "feat: complete Bridge Of Love production-ready platform"
   ```

2. Create a repository on **GitHub**:
   - Go to [github.com/new](https://github.com/new)
   - Name: `bridge-of-love`
   - Privacy: **Private** (recommended) or **Public**

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/bridge-of-love.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Create Free PostgreSQL Database on Neon.tech

1. Visit **[neon.tech](https://neon.tech)** and sign up with your GitHub account (No credit card needed).
2. Click **Create Project**:
   - **Project Name:** `bridge-of-love-db`
   - **Region:** Choose **Asia Pacific (Singapore)** or closest to your users.
   - **PostgreSQL Version:** 16 or 17.
3. Neon will display your **Connection Details**:
   - Select **Pooled connection** (Prisma works best with pooled URLs).
   - Copy the connection string. It looks like:
     ```text
     postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
   *(Save this connection string for Step 3).*

---

## Step 3: Deploy Backend API on Render.com

1. Go to **[render.com](https://render.com)** and sign up with GitHub (No credit card needed).
2. Click **New +** → **Web Service**.
3. Connect your `bridge-of-love` GitHub repository.
4. Fill in the deployment settings:
   - **Name:** `bridge-of-love-api`
   - **Region:** Singapore (or match your Neon DB region)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank — run from root)*
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm install && npm run build --workspace=@bridge-of-love/shared-types && npm run build --workspace=@bridge-of-love/ui-components && npm run build --workspace=@bridge-of-love/validation && npm run build --workspace=@bridge-of-love/api-server
     ```
   - **Start Command:**
     ```bash
     npx prisma db push --schema=apps/api-server/prisma/schema.prisma && node apps/api-server/dist/index.js
     ```
   - **Instance Type:** `Free`

5. Add **Environment Variables** in the Render dashboard:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Render standard port |
   | `DATABASE_URL` | *(Paste your Neon connection string from Step 2)* | Neon PostgreSQL |
   | `JWT_ACCESS_SECRET` | *(Generate a 64-char random string)* | Auth security |
   | `JWT_REFRESH_SECRET` | *(Generate another random string)* | Auth security |
   | `CORS_ORIGIN` | `https://YOUR-APP.vercel.app` *(update after Step 5)* | Allowed frontends |
   | `APP_URL` | `https://YOUR-APP.vercel.app` *(update after Step 5)* | Frontend URL |
   | `TRUST_NAME` | `Bridge Of Love Charitable Trust` | Trust display name |
   | `RAZORPAY_KEY_ID` | `rzp_test_...` *(or simulated demo key)* | Payment gateway key |
   | `RAZORPAY_KEY_SECRET` | *(your Razorpay secret)* | Payment signature secret |

6. Click **Deploy Web Service**.
7. Once deployed, Render will provide a free HTTPS URL:
   `https://bridge-of-love-api.onrender.com`
   *(Test it by opening `https://bridge-of-love-api.onrender.com/api/v1/health` in your browser. You should receive `{"status":"ok"}`).*

---

## Step 4: Seed Initial Admin & Demo Content

To populate your live database with the trust campaigns, initial activities, and admin account:

**Option A: Run from your local terminal pointing to Neon:**
```bash
# Temporarily set your local DATABASE_URL to your Neon DB string
export DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Seed the database
npm run prisma:seed --workspace=apps/api-server
```

**Option B: Using Render Shell:**
In the Render Web Service dashboard, go to the **Shell** tab and run:
```bash
npx tsx apps/api-server/prisma/seed.ts
```

Your live administrator login will be created:
- **Email:** `admin@bridgeoflove.org`
- **Password:** `Admin@BridgeOfLove2026!`

---

## Step 5: Deploy Frontend Web App to Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign up with GitHub.
2. Click **Add New...** → **Project**.
3. Import your `bridge-of-love` repository.
4. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select `apps/web`.
   - **Build Command:**
     ```bash
     npm run build --workspace=@bridge-of-love/shared-types && npm run build --workspace=@bridge-of-love/ui-components && npm run build --workspace=@bridge-of-love/validation && vite build
     ```
   - **Output Directory:** `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://bridge-of-love-api.onrender.com` *(your Render URL from Step 3)*
6. Click **Deploy**.
7. In ~60 seconds, your site is live at:
   `https://bridge-of-love.vercel.app` (or custom name).

8. **Update CORS in Render:**
   Go back to Render Web Service → **Environment**, and set `CORS_ORIGIN` and `APP_URL` to your actual Vercel URL (`https://bridge-of-love.vercel.app`).

---

## Step 6: Prevent Cold Starts (Free 24/7 Keep-Alive)

Render's free tier spins down web services if there are no requests for 15 minutes. To ensure the API responds instantly at all times:

1. Sign up for free at **[cron-job.org](https://cron-job.org)**.
2. Create a new cron job:
   - **Title:** `Ping Bridge Of Love API`
   - **URL:** `https://bridge-of-love-api.onrender.com/api/v1/health`
   - **Schedule:** Every 10 minutes (`*/10 * * * *`)
3. Save. This completely eliminates cold starts without costing a single rupee!

---

## Step 7: (Optional) Free Custom Domain Setup

If you purchase a custom domain like `bridgeoflove.org` (or already own one):
- **Frontend:** In Vercel → **Settings** → **Domains**, add `bridgeoflove.org` and `www.bridgeoflove.org`. Point your domain's DNS CNAME to `cname.vercel-dns.com`. Vercel provisions **Free SSL automatically**.
- **Backend:** In Render → **Settings** → **Custom Domains**, add `api.bridgeoflove.org`. Point a DNS CNAME to Render. Render provisions **Free SSL automatically**.

---

## ✅ Live Verification Checklist

Once deployed, verify your live system:
- [ ] Visit `https://your-app.vercel.app/` — homepage loads with editorial photography and impact numbers.
- [ ] Visit `https://your-app.vercel.app/transparency` — financial summaries and charts load from the live database.
- [ ] Visit `https://your-app.vercel.app/login` — log in with `admin@bridgeoflove.org` / `Admin@BridgeOfLove2026!`.
- [ ] Check Admin Dashboard — operational metrics, member directory, expense approvals, and audit logs.
- [ ] Test donation checkout — complete a test contribution and verify receipt generation.
- [ ] Visit `https://your-app.vercel.app/verify-receipt/BOL-2026-000001` — verify public receipt verification status.
