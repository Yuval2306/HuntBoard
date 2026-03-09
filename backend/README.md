# ApplyTrack 🚀

> Job application tracker for junior developers. Never lose track of an application again.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | JWT |
| AI | Gemini Flash (free) |
| Deploy Frontend | Vercel (free) |
| Deploy Backend | Render (free) |

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free) → https://cloud.mongodb.com
- Gemini API key (free) → https://aistudio.google.com/app/apikey

### 1. Backend Setup

```bash
cd applytrack-backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
# Server runs on http://localhost:5000
# Test: http://localhost:5000/health
```

### 2. Frontend Setup

```bash
cd applytrack-frontend
npm install
# .env.development already points to localhost:5000
npm run dev
# App runs on http://localhost:5173
```

---

## Getting MongoDB Atlas URI

1. Go to https://cloud.mongodb.com
2. Create free account → New Project → Build Database → **Free tier (M0)**
3. Create username & password (save them!)
4. Network Access → Add IP → **0.0.0.0/0** (allow all - required for Render)
5. Connect → Drivers → Copy the URI
6. Replace `<password>` with your actual password in the URI
7. Paste into `.env` as `MONGODB_URI`

---

## Deployment

### Step 1: GitHub
```bash
# Create two repos on GitHub:
# - applytrack-frontend
# - applytrack-backend

cd applytrack-backend
git init
git add .
git commit -m "feat: initial backend"
git remote add origin https://github.com/YOUR_USERNAME/applytrack-backend.git
git push -u origin main

cd ../applytrack-frontend
git init
git add .
git commit -m "feat: initial frontend"
git remote add origin https://github.com/YOUR_USERNAME/applytrack-frontend.git
git push -u origin main
```

### Step 2: Deploy Backend → Render (free)
1. Go to https://render.com → New → Web Service
2. Connect your `applytrack-backend` GitHub repo
3. Settings:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. Add Environment Variables:
   - `MONGODB_URI` = your Atlas URI
   - `JWT_SECRET` = any long random string (e.g. 64 random chars)
   - `NODE_ENV` = production
   - `FRONTEND_URL` = https://applytrack.vercel.app (add after Vercel deploy)
   - `EMAIL_USER` = your Gmail (optional)
   - `EMAIL_PASS` = Gmail App Password (optional)
5. Deploy → copy the URL (e.g. `https://applytrack-api.onrender.com`)

### Step 3: Deploy Frontend → Vercel (free)
1. Go to https://vercel.com → New Project
2. Import `applytrack-frontend` repo
3. Add Environment Variable:
   - `VITE_API_URL` = your Render backend URL
4. Deploy → get your URL (e.g. `https://applytrack.vercel.app`)

### Step 4: Update CORS
Go back to Render → Environment → update `FRONTEND_URL` to your Vercel URL → Redeploy.

---

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ |
| `JWT_SECRET` | Secret for signing JWT tokens | ✅ |
| `PORT` | Server port (default 5000) | No |
| `FRONTEND_URL` | Your Vercel URL (for CORS) | ✅ |
| `EMAIL_USER` | Gmail address for reminders | Optional |
| `EMAIL_PASS` | Gmail App Password | Optional |

### Frontend (.env.production)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your Render backend URL |

---

## API Endpoints

```
POST   /api/auth/register       Register new user
POST   /api/auth/login          Login
GET    /api/auth/me             Get current user
PATCH  /api/auth/settings       Update user settings

GET    /api/jobs                List all jobs (with filters)
POST   /api/jobs                Create job
GET    /api/jobs/stats          Get aggregated statistics
GET    /api/jobs/:id            Get single job
PATCH  /api/jobs/:id            Update job
DELETE /api/jobs/:id            Delete job

GET    /api/reminders/pending   Get jobs needing follow-up
POST   /api/reminders/send      Send reminder email

GET    /health                  Server health check
```

---

## Features

- ✅ JWT Authentication
- ✅ AI job extraction from URL (Gemini)
- ✅ Full CRUD for applications
- ✅ Status tracking (Applied → Interview → Offer)
- ✅ CV upload per application (base64)
- ✅ Contact person tracking
- ✅ Follow-up reminders with email
- ✅ Analytics dashboard with charts
- ✅ Daily LeetCode question
- ✅ Mobile responsive

---

*Built with ❤️ for junior developers navigating the job hunt*
