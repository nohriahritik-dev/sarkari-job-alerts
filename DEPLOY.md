# Deploying Sarkari Job Alerts — Free Stack

Frontend → **Vercel** (free)  
Backend API → **Render** (free)  
Database → **Neon** (free PostgreSQL)

---

## Step 1 — Database: Neon (free forever)

1. Go to <https://neon.tech> and sign up (GitHub login works).
2. Create a new project → choose the nearest region.
3. Copy the **connection string** (looks like `postgresql://user:pass@host/db?sslmode=require`).
4. Keep it handy — you'll paste it into Render in Step 2.

---

## Step 2 — Backend API: Render (free)

1. Go to <https://render.com> and sign up.
2. Click **New → Web Service** → connect your GitHub repo.
3. Set these fields:
   - **Name**: `sarkari-job-alert-api`
   - **Root Directory**: *(leave blank — monorepo root)*
   - **Build Command**: `pnpm install && pnpm --filter @workspace/api-server run build`
   - **Start Command**: `pnpm --filter @workspace/api-server run start`
   - **Plan**: Free
4. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | *your Neon connection string* |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
5. Click **Deploy**. Wait for it to finish (first deploy takes ~3 min).
6. Note your Render URL: `https://sarkari-job-alert-api.onrender.com`

> **Run DB migrations** (once): In Render's Shell tab run:
> ```
> pnpm --filter @workspace/db run db:push
> ```

---

## Step 3 — Frontend: Vercel (free)

1. Go to <https://vercel.com> and sign up.
2. Click **Add New Project** → import your GitHub repo.
3. Set **Root Directory** to `artifacts/job-alert`.
4. Vercel will auto-detect the `vercel.json` — no extra build settings needed.
5. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://sarkari-job-alert-api.onrender.com` |
6. Click **Deploy**. Your site will be live at `https://your-project.vercel.app`.

---

## Local development (no Replit)

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env files
cp artifacts/api-server/.env.example artifacts/api-server/.env
cp artifacts/job-alert/.env.example  artifacts/job-alert/.env
# → fill in DATABASE_URL in artifacts/api-server/.env

# 3. Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# 4. In a second terminal, start the frontend (port 5173)
pnpm --filter @workspace/job-alert run dev
# The Vite proxy automatically forwards /api/* → localhost:8080
```

Open <http://localhost:5173> — everything works without any env vars.

---

## Free tier limits

| Service | Limit |
|---------|-------|
| Vercel  | 100 GB bandwidth/mo, unlimited deployments |
| Render  | 750 hrs/mo (1 free service), sleeps after 15 min idle |
| Neon    | 0.5 GB storage, 190 hrs compute/mo |
