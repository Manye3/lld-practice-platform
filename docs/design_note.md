# Design Note — LLD Practice Platform (MVP)

## 1. User Flow

The platform implements a single, focused learner journey:

```
┌──────────┐    ┌──────────────┐    ┌──────────────────┐    ┌────────┐
│  Choose  │───▶│    Read      │───▶│  Design Solution │───▶│ Submit │
│  Problem │    │ Requirements │    │  (classes, rels,  │    │        │
│          │    │              │    │   decisions)      │    │        │
└──────────┘    └──────────────┘    └──────────────────┘    └───┬────┘
                                                                │
                ┌──────────────┐    ┌──────────────────┐        │
                │  Try Again   │◀───│  View Feedback   │◀───────┘
                │  (iterate)   │    │ (structural + AI) │
                └──────────────┘    └──────────────────┘
                        │
                        ▼
               ┌────────────────┐
               │ Review Attempt │
               │    History     │
               └────────────────┘
```

**Step-by-step:**

1. **Choose Problem** — Learner selects from available LLD challenges (Parking Lot, Elevator System, Vending Machine). Each problem displays difficulty and a brief description.
2. **Read Requirements** — The problem page presents functional requirements, context, and constraints. The learner reads and internalizes the problem before designing.
3. **Design Solution** — The learner builds their solution using a structured form:
   - **Classes**: name, responsibilities (list), key attributes (list)
   - **Relationships**: source class → target class, type (inheritance / composition / aggregation / dependency / association), description
   - **Design Decisions**: free-text entries explaining *why* they made specific choices
4. **Submit** — The structured submission is sent for evaluation. The attempt status transitions from `in_progress` → `submitted` → `evaluated`.
5. **View Feedback** — The learner sees a composite feedback panel:
   - Overall score (0–100) with category breakdown
   - Strengths (what they did well)
   - Improvements (what to work on)
   - Individual feedback items categorized by type and severity
6. **Review Attempt History** — A timeline view showing all attempts for this problem, with score progression and per-attempt feedback.
7. **Try Again** — The learner iterates on their design, guided by the feedback, and submits a new attempt.

---

## 2. Domain Model

### Core Classes

```
┌────────────────┐       ┌────────────────┐       ┌────────────────────┐
│    Problem     │       │    Attempt     │       │    Submission      │
├────────────────┤  1──* ├────────────────┤  1──1 ├────────────────────┤
│ id             │◀──────│ id             │──────▶│ id                 │
│ title          │       │ problemId      │       │ attemptId          │
│ description    │       │ learnerId      │       │ classes[]          │
│ difficulty     │       │ status         │       │   .name            │
│ requirements[] │       │ startedAt      │       │   .responsibilities│
│ context        │       │ submittedAt    │       │   .attributes      │
│ expectedEntities│      │ evaluatedAt    │       │ relationships[]    │
│ category       │       └────────────────┘       │   .source          │
└────────────────┘                                │   .target          │
                                                  │   .type            │
       ┌────────────────┐       ┌─────────────┐   │   .description     │
       │  Evaluation    │       │FeedbackItem │   │ designDecisions[]  │
       ├────────────────┤  1──* ├─────────────┤   └────────────────────┘
       │ id             │──────▶│ id          │
       │ attemptId      │       │ category    │
       │ overallScore   │       │ severity    │
       │ strengths[]    │       │ message     │
       │ improvements[] │       │ details     │
       │ deterministicScore│    └─────────────┘
       │ llmScore       │
       │ evaluatedAt    │
       └────────────────┘
```

### Class Responsibilities

#### `Problem`
Represents an LLD challenge presented to the learner.

| Field | Purpose |
|---|---|
| `id` | Unique identifier |
| `title` | Display name (e.g., "Parking Lot System") |
| `description` | Brief overview of what the system does |
| `difficulty` | `easy` / `medium` / `hard` — signals expected complexity |
| `requirements` | List of functional requirements the design should address |
| `context` | Background paragraph explaining real-world usage |
| `expectedEntities` | List of class names a good design should include (used by deterministic evaluator) |
| `category` | Grouping tag (e.g., "structural", "behavioral") |

**Key design choice:** `expectedEntities` is stored on the Problem, not inferred at evaluation time. This makes deterministic evaluation fast, predictable, and editable by content authors without touching evaluator code.

#### `Attempt`
Represents a learner's session of working on a specific problem. Acts as the lifecycle container.

| Field | Purpose |
|---|---|
| `id` | Unique identifier |
| `problemId` | Links to the Problem being attempted |
| `learnerId` | Identifies the learner (localStorage-based for MVP) |
| `status` | State machine: `in_progress` → `submitted` → `evaluated` (or `evaluation_failed`) |
| `startedAt` | Timestamp when the learner started this attempt |
| `submittedAt` | Timestamp when the submission was finalized |
| `evaluatedAt` | Timestamp when evaluation completed |

**Key design choice:** Attempt is separate from Submission to cleanly represent the lifecycle. An attempt exists from the moment the learner begins working; a submission only exists once they finalize their design.

#### `Submission`
The learner's actual design solution, in structured form.

| Field | Purpose |
|---|---|
| `classes[]` | Array of designed classes, each with `name`, `responsibilities[]`, and `attributes[]` |
| `relationships[]` | Array of relationships, each with `source`, `target`, `type` (inheritance/composition/aggregation/dependency/association), and `description` |
| `designDecisions[]` | Array of free-text strings explaining the learner's rationale |

**Key design choice:** Structured format (not free-text) enables programmatic evaluation. Each class has explicit responsibilities and attributes, making SRP analysis and entity coverage checks straightforward.

#### `Evaluation`
The feedback result produced by the evaluation pipeline.

| Field | Purpose |
|---|---|
| `overallScore` | Composite score (0–100) |
| `deterministicScore` | Score from rule-based evaluation (0–100) |
| `llmScore` | Score from AI evaluation (0–100, nullable if LLM unavailable) |
| `strengths[]` | List of things the learner did well |
| `improvements[]` | List of actionable suggestions |
| `feedbackItems[]` | Detailed, categorized feedback observations |

#### `FeedbackItem`
A single observation within an evaluation.

| Field | Values |
|---|---|
| `category` | `entity_coverage` · `relationship_quality` · `responsibility_assignment` · `solid_principles` · `design_completeness` · `naming_conventions` · `extensibility` · `edge_cases` |
| `severity` | `positive` (reinforcement) · `suggestion` (improvement opportunity) · `warning` (notable issue) · `critical` (fundamental problem) |
| `message` | Human-readable feedback statement |
| `details` | Optional — additional context, examples, or references |

---

## 3. Evaluation Approach (Strategy Pattern)

Evaluation is the core value proposition. We implement it using the **Strategy Pattern** to allow multiple evaluation approaches to coexist, compose, and evolve independently.

```
                    ┌──────────────────────┐
                    │   «interface»        │
                    │    Evaluator         │
                    ├──────────────────────┤
                    │ evaluate(submission, │
                    │   problem)           │
                    │   → Evaluation       │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
  ┌───────────▼──────┐ ┌──────▼───────┐ ┌──────▼──────────┐
  │ Deterministic    │ │    LLM       │ │   Composite     │
  │ Evaluator        │ │  Evaluator   │ │   Evaluator     │
  ├──────────────────┤ ├──────────────┤ ├─────────────────┤
  │ Rule-based       │ │ Gemini API   │ │ Orchestrates    │
  │ structural       │ │ with rubric  │ │ both evaluators │
  │ analysis         │ │ prompt       │ │ merges results  │
  └──────────────────┘ └──────────────┘ └─────────────────┘
```

### 3.1 DeterministicEvaluator

Rule-based structural analysis that runs instantly and never fails. Produces a score in four categories:

| Category | Points | What It Checks |
|---|---|---|
| **Entity Coverage** | 0–30 | Are the expected classes present? Fuzzy-matched against `problem.expectedEntities`. Partial credit for near-matches. |
| **Relationship Coverage** | 0–25 | Are relationships defined between classes? Are relationship types specified? Are they semantically reasonable (e.g., composition for "ParkingLot has ParkingSpots")? |
| **Responsibility Assignment** | 0–25 | Does each class have responsibilities defined? Are responsibilities reasonably scoped (SRP heuristic: flag classes with >5 responsibilities)? Are there classes with zero responsibilities? |
| **Design Completeness** | 0–20 | Minimum class count threshold met? Design decisions documented? Sufficient attributes defined? |

**Scoring logic example (Entity Coverage):**
```
matchedEntities = fuzzyMatch(submission.classes, problem.expectedEntities)
coverageRatio = matchedEntities.length / problem.expectedEntities.length
score = Math.round(coverageRatio * 30)
```

### 3.2 LLMEvaluator

Sends the structured submission and problem requirements to the **Google Gemini API** with a carefully engineered rubric-based prompt. The prompt instructs the model to:

1. Evaluate against the specific problem's requirements (not generic design principles)
2. Score across defined categories (SOLID adherence, abstraction quality, extensibility, naming, edge cases)
3. Return a **structured JSON response** with scores, strengths, improvements, and categorized feedback items with severity levels

**Prompt structure:**
```
You are an expert software design reviewer evaluating an LLD solution.

PROBLEM: {problem.title}
REQUIREMENTS: {problem.requirements}

SUBMISSION:
Classes: {submission.classes}
Relationships: {submission.relationships}
Design Decisions: {submission.designDecisions}

Evaluate this design and return JSON in the following format:
{
  "score": <0-100>,
  "strengths": ["..."],
  "improvements": ["..."],
  "feedbackItems": [
    { "category": "...", "severity": "...", "message": "..." }
  ]
}

Rubric: ...
```

**Failure handling:** The LLM call is wrapped in a try-catch with a timeout. On failure (API error, rate limit, malformed response), the evaluator returns `null` rather than throwing — the CompositeEvaluator handles graceful degradation.

### 3.3 CompositeEvaluator

Orchestrates both evaluators and merges their results:

```
async evaluate(submission, problem):
    deterministicResult = deterministicEvaluator.evaluate(submission, problem)

    try:
        llmResult = await llmEvaluator.evaluate(submission, problem)
    catch:
        llmResult = null

    if llmResult:
        overallScore = 0.4 * deterministicResult.score + 0.6 * llmResult.score
        feedbackItems = merge(deterministicResult.items, llmResult.items)
    else:
        overallScore = deterministicResult.score
        feedbackItems = deterministicResult.items
        // Add note: "AI feedback unavailable, showing structural analysis only"

    return Evaluation(overallScore, feedbackItems, ...)
```

**Weight rationale:** 60% LLM weight because design quality (abstraction, SOLID, extensibility) is inherently qualitative and better assessed by the LLM. 40% deterministic weight because structural completeness is a reliable, objective baseline. If LLM is unavailable, 100% deterministic — learner still gets actionable feedback.

---

## 4. Key Trade-offs

### Trade-off 1: Structured vs. Free-text Submissions

| | Structured | Free-text |
|---|---|---|
| **Learner friction** | Higher — must fill in classes, relationships, attributes | Lower — describe in natural language |
| **Evaluation quality** | High — programmatic checks, entity matching, SRP analysis | Low — requires NLP to extract design elements |
| **Attempt comparison** | Easy — structured diff between submissions | Hard — text diff is meaningless for design |
| **Feedback specificity** | High — "Class X has 7 responsibilities, consider splitting" | Low — "Your design seems to have some large classes" |

**Decision:** Structured. The marginal friction is worth the dramatically better feedback quality. The structured format also enables the deterministic evaluator to exist at all.

### Trade-off 2: Two-layer Evaluation vs. LLM-only

| | Two-layer | LLM-only |
|---|---|---|
| **Reliability** | Always returns feedback | Fails on API errors, rate limits |
| **Consistency** | Deterministic layer is reproducible | LLM scores vary between runs |
| **Depth** | Structural + qualitative | Qualitative only |
| **Complexity** | Higher — two evaluators + merging logic | Lower — single API call |

**Decision:** Two-layer. The deterministic evaluator takes ~200 lines of code but makes the system dramatically more robust. A learner should never submit a design and get zero feedback.

### Trade-off 3: localStorage Identity vs. Authentication

| | localStorage | Auth (OAuth/email) |
|---|---|---|
| **Setup friction** | Zero | Requires account creation |
| **Cross-device** | No — history is per-browser | Yes |
| **Implementation** | Trivial — generate UUID on first visit | Significant — OAuth flow, session management |

**Decision:** localStorage for MVP. This is a 2-day prototype. Cross-device continuity is a nice-to-have that doesn't justify the implementation cost at this stage.

### Trade-off 4: SQLite vs. PostgreSQL/MongoDB

| | SQLite | PostgreSQL | MongoDB |
|---|---|---|---|
| **Setup** | Zero — file-based | Requires server/container | Requires server/container |
| **Concurrent writes** | Limited | Excellent | Good |
| **Schema** | Rigid (relational) | Rigid (relational) | Flexible (document) |
| **Deployment** | Single file | Separate service | Separate service |

**Decision:** SQLite. Zero-setup persistence is essential for a prototype that must be runnable immediately after `npm install`. The submission data (classes, relationships) is stored as JSON text within SQLite columns — a pragmatic hybrid that gives us relational structure for queries with document flexibility for nested data.

---

## 5. Extensibility

The architecture is designed for growth along four axes:

| Extension Point | How to Extend | Example |
|---|---|---|
| **New evaluators** | Implement the `Evaluator` interface; register with `CompositeEvaluator` | `PeerReviewEvaluator`, `DiagramEvaluator` |
| **New submission formats** | Add a parser that converts the format into the internal `Submission` structure | PlantUML parser, actual code parser |
| **New problems** | Add entries to the seed data file; no code changes needed | "Library Management System", "ATM Machine" |
| **New feedback categories** | Extend the `FeedbackItem` category enum and update evaluator logic | `concurrency_safety`, `error_handling` |
| **New frontends** | The REST API is frontend-agnostic | Mobile app, CLI tool, VS Code extension |
