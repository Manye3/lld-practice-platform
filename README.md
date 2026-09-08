# LLD Practice Platform

A focused practice platform for Low-Level Design (LLD) interview preparation. It helps engineers move beyond passively reading system design solutions by letting them structure class models, relationships, and design trade-offs, submit them, and receive explainable feedback combining deterministic checks with AI review.

Built as an engineering assignment for CipherSchools by **Manye Gupta** (The LNM Institute of Information Technology).

---

## The Problem: Why LLD Practice is Broken

When preparing for low-level design / machine coding rounds (Parking Lot, Elevator System, Vending Machine):
- **LeetCode / coding platforms** only check unit test passes and execution output. A piece of code can pass all tests while completely violating SRP, having rigid coupling, or missing key domain abstractions.
- **YouTube walkthroughs and blogs** are passive. Reading a senior engineer's solution makes intuitive sense, but when given a blank slate, learners struggle to structure classes, pick design patterns, or identify edge cases.
- **Generic LLM prompts** in ChatGPT/Claude are unstructured. There is no historical tracking, no baseline rubric, and scores fluctuate wildly between runs.

This project bridges that gap by implementing a complete practice loop:
```
Choose Problem -> Define Classes & Relationships -> Submit -> Receive Structured Feedback -> Review History -> Iterate
```

---

## How Evaluation Works (Two-Layer Hybrid Approach)

Rather than treating AI as a black box, the platform uses a two-tier evaluation engine orchestrated via the **Strategy Pattern**:

### 1. Deterministic Evaluator (Fast, Objective Baseline)
Runs locally in milliseconds with zero external API dependencies:
- **Entity Coverage (30%)**: Checks if key domain entities (e.g., `ParkingFloor`, `ParkingSpot`, `Ticket`, `PaymentProcessor`) are present.
- **Relationship Integrity (25%)**: Validates that classes are interconnected and relationship types (composition, aggregation, inheritance, association) are specified.
- **Responsibility Distribution & SRP (25%)**: Flags god classes with bloated responsibilities (>5 methods/responsibilities) and warns on empty classes.
- **Completeness & Modularity (20%)**: Verifies multi-class abstraction and structural depth.

### 2. LLM Evaluator (Qualitative Design Review)
Uses Google's Gemini API with a structured rubric to evaluate nuanced design decisions:
- Adherence to SOLID principles and clean abstraction boundaries.
- Appropriateness of design patterns (Strategy for pricing, State for vending machine, Observer for displays).
- Extensibility under new requirements.
- Returns strengths, specific recommendations, and categorized issues with severity levels (`positive`, `suggestion`, `warning`, `critical`).

### 3. Composite Orchestrator & Graceful Fallback
`CompositeEvaluator` runs the deterministic checks first, attempts the LLM review, and computes a weighted score (40% deterministic, 60% LLM). 
**Crucially, if the API key is absent or times out, the platform degrades gracefully to 100% deterministic evaluation.** The learner is never blocked.

---

## Tech Stack & Architecture

- **Backend**: Node.js + Express (ES Modules)
- **Persistence**: SQLite via `better-sqlite3` (Zero-setup file database, storing structured JSON payloads inside relational rows)
- **Frontend**: React 18, Vite, React Router, Custom Responsive CSS
- **Testing**: Node.js Native Test Runner (`node:test`, `assert/strict`)
- **AI Integration**: Google Gemini API (`gemini-2.0-flash`)

### Project Structure

```
lld-practice-platform/
├── package.json                  # Root runner scripts
├── README.md                     # Project overview and setup guide
├── AI_USAGE.md                   # 5 documented AI-assisted engineering decisions
├── docs/
│   ├── research_note.md          # Analysis of existing LLD tools & identified gaps
│   └── design_note.md            # Domain model, user flow, and design trade-offs
├── server/
│   ├── src/
│   │   ├── domain/               # Core domain entities: Problem, Attempt, Submission, Evaluation
│   │   ├── evaluation/           # Evaluator interface, Deterministic, LLM, Composite strategies
│   │   ├── repository/           # Repository pattern data access layer
│   │   ├── services/             # PracticeService and EvaluationService
│   │   ├── api/                  # Express routes (/problems, /attempts, /submissions)
│   │   ├── seed/                 # Curated problems (Parking Lot, Elevator, Vending Machine)
│   │   ├── db.js                 # SQLite database setup
│   │   └── app.js                # Express app entry point
│   ├── tests/                    # Automated unit and integration tests
│   │   ├── domain/               # Submission model tests
│   │   └── evaluation/           # Deterministic & Composite evaluator tests
│   └── package.json
└── client/
    ├── src/
    │   ├── components/           # DesignEditor, FeedbackPanel, LoadingSpinner
    │   ├── pages/                # HomePage, PracticePage, HistoryPage
    │   ├── api.js                # Frontend API client
    │   ├── App.jsx & App.css     # App layout and custom styles
    │   └── main.jsx              # React DOM root mount
    ├── vite.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Manye3/lld-practice-platform.git
   cd lld-practice-platform
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **(Optional) Configure Gemini API Key:**
   To enable qualitative AI feedback, add your API key in `server/.env`:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3001
   ```
   *Note: If no key is configured, the platform will continue running seamlessly in deterministic evaluation mode.*

4. **Run Automated Tests:**
   ```bash
   npm test
   ```
   Runs 10 unit and integration tests covering domain validations, SRP detection, and evaluator fallbacks.

5. **Start the Platform:**
   In one terminal, start the backend server:
   ```bash
   npm run server:dev
   ```
   In a second terminal, start the frontend development client:
   ```bash
   npm run client
   ```
   Open **http://localhost:5173** in your browser.

---

## Key Design Decisions & Trade-offs

1. **Structured Input vs. Free-form Markdown:**
   We chose a structured class/relationship/decision editor over a plain text box. While structured forms have slightly more input friction, they allow unambiguous static analysis of class coupling and SRP, make diffing between attempts possible, and provide cleaner prompt context to the LLM.
2. **Monolith vs. Microservices:**
   Built as a clean modular monolith. For an MVP targeted at individual learning loops, microservices or distributed queues introduce unnecessary operational overhead.
3. **Client-side Session Identity (localStorage UUID):**
   To let learners jump straight into practicing without a mandatory signup gate, learner identities are generated as UUIDs stored in browser localStorage.

---

## Submission Artifacts

- **Research Note**: Located in [`docs/research_note.md`](docs/research_note.md)
- **Design Note**: Located in [`docs/design_note.md`](docs/design_note.md)
- **AI Decision Log**: Located in [`AI_USAGE.md`](AI_USAGE.md)

---

## Author

**Manye Gupta**  
- GitHub: [@Manye3](https://github.com/Manye3)  
- LinkedIn: [linkedin.com/in/manyegupta](https://www.linkedin.com/in/manyegupta/)  
- Email: manyegupta0301@gmail.com  
