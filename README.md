# 🎯 HuntBoard

> **A smart job application tracker built for developers.**  
> Track every application, extract job details with AI, and stay on top of your job hunt.

🌐 **Live Demo:** [huntboard-r0mi.onrender.com](https://huntboard-r0mi.onrender.com)

---

## ✨ Features

- **🤖 AI Job Extraction** — Paste a job URL and let Gemini AI automatically fill in the job details
- **📋 Application Tracker** — Track every application with status, field, location, salary and more
- **📊 Analytics Dashboard** — Visualize your job hunt progress with charts and stats
- **🔔 Follow-up Reminders** — Never forget to follow up on an application
- **🧩 LeetCode Daily** — Built-in LeetCode daily challenge and tips
- **🔐 Secure Auth** — JWT-based authentication with encrypted passwords
- **☁️ Cloud Storage** — All data stored in MongoDB Atlas, accessible from anywhere

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)
![Recharts](https://img.shields.io/badge/Recharts-2-22B5BF?style=flat)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat&logo=node.js)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)

### AI & Services
![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=flat&logo=google)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat&logo=jsonwebtokens)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Google Gemini API key (free)

### 1. Clone the repository
```bash
git clone https://github.com/Yuval2306/HuntBoard.git
cd HuntBoard
```

### 2. Setup the Backend
```bash
cd applytrack-backend
npm install
```

Create a `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:
```bash
npm run dev
```

### 3. Setup the Frontend
```bash
cd applytrack-frontend
npm install
```

Create a `.env.development` file:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

### 4. Open the app
Navigate to `http://localhost:5173` 🎉

---

## 📁 Project Structure

```
HuntBoard/
├── applytrack-backend/
│   ├── src/
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   └── server.js       # Express app
│   └── package.json
│
└── applytrack-frontend/
    ├── src/
    │   ├── pages/          # React pages
    │   ├── components/     # Reusable components
    │   ├── contexts/       # Auth & Jobs context
    │   └── utils/          # API client & helpers
    └── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/jobs` | Get all jobs |
| POST | `/api/jobs` | Add new job |
| PATCH | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |
| GET | `/api/jobs/stats` | Get analytics |
| POST | `/api/extract` | AI job extraction |
| GET | `/health` | Health check |

---

## 🌍 Deployment

- **Frontend:** Render (Static Site)
- **Backend:** Render (Web Service)
- **Database:** MongoDB Atlas (Free M0 cluster)

---

## 👤 Author

**Yuval Boker**  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Yuval%20Boker-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/yuval-boker-43792537b/)
[![GitHub](https://img.shields.io/badge/GitHub-Yuval2306-181717?style=flat&logo=github)](https://github.com/Yuval2306)

---

## 📄 License

MIT License — feel free to use and modify.

---

<p align="center">Built with ❤️ by Yuval Boker</p>
