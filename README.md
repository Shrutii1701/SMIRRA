# SMIRRA — AI Mock Interview Practice Arena

SMIRRA is a gamified mock-interview platform that uses Google's Gemini AI to generate
dynamic technical interview questions and evaluate your answers in real time. Practice
by topic and difficulty, get scored across multiple dimensions, and climb the ranks with
XP, streaks, time bonuses, and a combo system.

## Features

- **AI-generated questions** — dynamic, non-repeating questions tailored to a chosen topic, difficulty, and question format (powered by `gemini-1.5-flash`).
- **AI answer evaluation** — each answer is scored 0–100 across five metrics: technical accuracy, completeness, clarity, relevance, and communication, plus written feedback and a list of missing concepts.
- **Adaptive difficulty** — each 5-question session adjusts itself as you go: 3 strong answers in a row (score ≥ 70) bumps the difficulty up a rung, while struggling (2 answers < 50) eases it back down, with the shift surfaced live in the interview.
- **Gamification** — XP, levels, and daily streaks, with per-answer scoring bonuses:
  - **Time bonus** — faster answers earn more (`<30s` → +20, `30–60s` → +10, `60–90s` → +5).
  - **Combo system** — consecutive strong answers (score ≥ 70) build a combo multiplier; a weak answer resets it.
  - **Achievements** — 14 unlockable badges across bronze/silver/gold/platinum tiers (session milestones, scores, streaks, level, and topic breadth), shown on the dashboard with progress bars and celebrated on the results screen when freshly earned.
- **Protected practice arena** — lightweight local login (stored in `localStorage`) gating the dashboard, setup, interview, and results pages.

## Tech Stack

| Layer     | Technology                                                        |
| --------- | ----------------------------------------------------------------- |
| Frontend  | React 19, Vite, React Router, Tailwind CSS, lucide-react          |
| Backend   | Node.js, Express, `@google/generative-ai` (Gemini)                |
| Database  | MongoDB via Mongoose (optional; falls back to `localStorage`)      |
| AI Model  | Google Gemini `gemini-1.5-flash`                                  |

The backend acts as a **proxy server** so the Gemini API key stays on the server and is never exposed to the browser.

## Project Structure

```
SMIRRA/
├── backend/
│   ├── config/db.js                    # Mongoose connection
│   ├── controllers/
│   │   ├── interviewController.js       # question generation + answer evaluation
│   │   └── userController.js            # login, profile, session persistence
│   ├── models/
│   │   ├── User.js                      # user + gamification state
│   │   └── Interview.js                 # completed session records
│   ├── routes/
│   │   ├── interviewRoutes.js           # /api/interview/*
│   │   └── userRoutes.js                # /api/user/*
│   ├── services/
│   │   ├── geminiService.js             # Gemini prompt building & JSON parsing
│   │   └── scoringService.js            # time bonus, combo, XP/level/streak
│   ├── server.js                        # Express app entry point
│   └── .env.example                     # Environment variable template
└── frontend/
    ├── src/
    │   ├── pages/                       # Home, Login, Dashboard, InterviewSetup, Interview, Results
    │   ├── components/                  # Navbar
    │   ├── context/UserContext.jsx      # Auth + user progress (syncs with backend)
    │   └── services/api.js              # Calls to the backend proxy
    └── vite.config.js
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- A **Google Gemini API key** — get one free at [Google AI Studio](https://aistudio.google.com/app/apikey)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Shrutii1701/SMIRRA.git
cd SMIRRA
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file from the template and add your Gemini API key:

```bash
cp .env.example .env
```

Then edit `backend/.env`:

```
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string_here
```

> `MONGODB_URI` enables account persistence and interview history (a free
> [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster or a local
> `mongodb://127.0.0.1:27017/smirra`). If you leave it blank the app still runs, but
> falls back to browser-only (`localStorage`) storage with no server-side history.

Start the backend server:

```bash
npm run dev     # with auto-reload (nodemon)
# or
npm start
```

The API runs at `http://localhost:5000`.

### 3. Set up the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` (Vite's default) and talks to the backend at `http://localhost:5000/api`.

## API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint                | Description                                                          |
| ------ | ----------------------- | ------------------------------------------------------------------- |
| `GET`  | `/health`               | Health check.                                                       |
| `POST` | `/interview/question`   | Generate a question. Body: `topic`, `difficulty`, `questionType`, `previousQuestions`. |
| `POST` | `/interview/evaluate`   | Evaluate an answer and compute bonuses. Body: `question`, `answer`, `topic`, `difficulty`, `timeTaken`, `combo`. |
| `POST` | `/user/login`           | Passwordless login — upserts the user by email, returns profile + history. Body: `name`, `email`. |
| `GET`  | `/user/:id`             | Fetch a user's profile and interview history.                       |
| `POST` | `/user/:id/session`     | Persist a completed interview and update XP/level/streak. Body: `topic`, `difficulty`, `gradedResponses`. |

## Scripts

**Backend**
- `npm run dev` — start with nodemon (auto-reload)
- `npm start` — start with node

**Frontend**
- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — run oxlint

## Environment Variables

| Variable         | Location      | Description                                             |
| ---------------- | ------------- | ------------------------------------------------------- |
| `PORT`           | `backend/.env`| Backend server port (default `5000`).                   |
| `GEMINI_API_KEY` | `backend/.env`| Your Google Gemini API key.                             |
| `MONGODB_URI`    | `backend/.env`| MongoDB connection string. Optional — blank = local-only storage. |

> **Note:** `backend/.env` is gitignored and must never be committed. Only `.env.example` is tracked.

## License

This project is currently unlicensed. Add a license file if you intend to distribute it.
