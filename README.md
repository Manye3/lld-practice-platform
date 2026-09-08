# LLD Practice Platform

A structured practice environment for Low-Level Design problems with AI-powered feedback. Submit your design for systems like Parking Lot, Elevator, and Vending Machine — get instant structural analysis and rich AI design review.

> **CipherSchools 2-Day Engineering Assignment**

---

## ✨ Features

- **Curated LLD Problems** — Parking Lot, Elevator System, and Vending Machine with detailed requirements and context
- **Structured Design Submission** — Define classes (with responsibilities & attributes), relationships (with types), and design decisions
- **Two-Layer Evaluation**
  - *Deterministic*: Entity coverage, relationship analysis, SRP checks, completeness scoring
  - *AI-Powered*: Gemini API-based qualitative review of SOLID adherence, abstraction quality, extensibility, and naming
- **Graceful Degradation** — Works without an API key using deterministic-only evaluation
- **Attempt History** — Track score progression across multiple attempts per problem
- **Categorized Feedback** — Feedback items tagged by category and severity (positive / suggestion / warning / critical)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, Tailwind CSS |
| **Backend** | Node.js + Express |
| **Database** | SQLite (via better-sqlite3) |
| **AI Evaluation** | Google Gemini API |
| **Language** | JavaScript (ES Modules) |

---

## 📋 Prerequisites

- **Node.js 18+** and npm
- *(Optional)* Google Gemini API key — for AI-powered feedback. Without it, the platform provides deterministic evaluation only.

---

## 🚀 Setup & Running

```bash
# Clone the repository
git clone <repo-url>
cd lld-practice-platform

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Configure Environment (Optional)

Create a `.env` file in the `server/` directory:

```env
# Optional — enables AI-powered design feedback
# Without this, the platform still works with deterministic-only evaluation
GEMINI_API_KEY=your_api_key_here

# Server configuration (defaults shown)
PORT=3001
```

### Start the Application

```bash
# Terminal 1 — Start the backend
cd server
npm run dev
# Server runs at http://localhost:3001

# Terminal 2 — Start the frontend
cd client
npm run dev
# Client runs at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🎯 How It Works

```
1. CHOOSE      → Pick an LLD problem (Parking Lot, Elevator, Vending Machine)
2. READ        → Study the requirements and context
3. DESIGN      → Define your classes, relationships, and design decisions
4. SUBMIT      → Send your structured solution for evaluation
5. REVIEW      → View your score, strengths, improvements, and categorized feedback
6. ITERATE     → Refine your design based on feedback and submit again
7. TRACK       → See your score progression across attempts
```

---

## 📁 Project Structure

```
lld-practice-platform/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   ├── ProblemList/     # Problem selection grid
│   │   │   ├── ProblemDetail/   # Requirements view
│   │   │   ├── SubmissionForm/  # Structured design editor
│   │   │   ├── FeedbackPanel/   # Evaluation results display
│   │   │   └── AttemptHistory/  # Score progression timeline
│   │   ├── services/           # API client
│   │   ├── hooks/              # Custom React hooks
│   │   └── App.jsx             # Routing and layout
│   └── package.json
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── models/             # Domain model classes
│   │   │   ├── Problem.js
│   │   │   ├── Attempt.js
│   │   │   ├── Submission.js
│   │   │   ├── Evaluation.js
│   │   │   └── FeedbackItem.js
│   │   ├── evaluators/         # Evaluation strategy implementations
│   │   │   ├── Evaluator.js              # Abstract base class
│   │   │   ├── DeterministicEvaluator.js # Rule-based structural analysis
│   │   │   ├── LLMEvaluator.js           # Gemini API integration
│   │   │   └── CompositeEvaluator.js     # Orchestration + merging
│   │   ├── routes/             # Express route handlers
│   │   ├── data/               # Seed data (problems)
│   │   └── db/                 # SQLite setup and queries
│   └── package.json
│
├── docs/
│   ├── research_note.md        # Learner problem analysis & existing approaches
│   └── design_note.md          # MVP design: domain model, evaluation, trade-offs
│
├── AI_USAGE.md                 # AI-assisted decision log
└── README.md                   # This file
```

---

## 🏗️ Key Design Decisions

### 1. Structured Submissions over Free-text
Learners define classes, relationships, and decisions in a structured format rather than describing their design in prose. This enables programmatic evaluation (entity matching, SRP checks) and meaningful comparison between attempts. The slight input friction is worth the dramatically better feedback quality.

### 2. Two-Layer Evaluation Pipeline
- **Deterministic layer** — instant, reproducible, always available. Catches structural issues (missing entities, undefined relationships, overloaded classes).
- **LLM layer** — rich, qualitative, best-effort. Evaluates design principles, abstraction quality, and extensibility.
- **Composite orchestration** — runs both, merges results (40% deterministic / 60% LLM). Degrades gracefully to deterministic-only if AI is unavailable.

### 3. Strategy Pattern for Evaluation
Evaluators implement a common interface (`evaluate(submission, problem) → Evaluation`), making it trivial to add new evaluation strategies (peer review, diagram-based, etc.) without modifying existing code.

### 4. SQLite for Zero-Setup Persistence
A file-based database that requires no infrastructure. Submission data (nested classes, relationships) is stored as JSON within relational rows — a pragmatic hybrid for a prototype.

### 5. localStorage-Based Identity
No authentication. A UUID is generated on first visit and stored in localStorage. Removes all friction for trying the platform. Acceptable trade-off for an MVP where cross-device continuity isn't critical.

---

## ⚠️ Known Limitations

- **Single-user prototype** — SQLite and localStorage don't support multi-user or cross-device usage
- **No real-time collaboration** — Designed for individual practice, not team exercises
- **LLM score variance** — AI scores may vary slightly between identical submissions due to model non-determinism
- **Limited problem set** — Ships with 3 problems; adding more requires seed data updates
- **No diagram input** — Learners define design via form, not UML diagrams
- **No code validation** — The platform evaluates design, not code correctness

---

## 🔮 Future Improvements

- **More problems** — Library Management, ATM, Snake & Ladder, Tic-Tac-Toe
- **UML diagram input** — Accept PlantUML or visual diagramming as submission format
- **Peer review** — Let learners review each other's designs
- **Code generation** — Generate skeleton code from submitted designs
- **Authentication** — OAuth for cross-device attempt history
- **Leaderboard** — Compare anonymized scores across learners
- **Export** — Download feedback as PDF for interview prep

---

## 📄 License

MIT
