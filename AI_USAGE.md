# AI Usage Log — LLD Practice Platform

This document records meaningful instances where AI tools (ChatGPT, Claude, Gemini) were used during the design and development of the LLD Practice Platform. For each decision, I document what the AI suggested, what I accepted or modified, and why.

---

## Decision 1: Evaluation Rubric Design — Split vs. Monolithic

### Context
I needed to design how learner submissions are evaluated. The evaluation is the core value proposition of the platform — it must be reliable, explainable, and useful.

### What AI Suggested
A single LLM prompt that scores everything holistically — send the entire submission to Gemini and ask it to return a score and feedback covering all aspects (entity coverage, SOLID principles, completeness, naming, etc.) in one call.

### What I Modified
I split evaluation into two distinct layers:
- **Deterministic Evaluator** — Rule-based structural analysis (entity coverage, relationship checks, SRP heuristics, completeness metrics). Fast, reproducible, always available.
- **LLM Evaluator** — Qualitative design review via Gemini API. Rich but unreliable (API errors, rate limits, non-deterministic scores).

### Why
A single LLM call is a single point of failure. If the API is down, the learner gets zero feedback — unacceptable for a practice tool. Additionally, LLM scores are non-reproducible; the same submission can get 72 one time and 81 the next. The deterministic layer provides a consistent, explainable baseline that the learner can directly act on ("You're missing 3 expected entities" is more actionable than "Your design could include more classes").

### Outcome
The `CompositeEvaluator` orchestrates both layers. Deterministic runs first (always succeeds), LLM runs second (best-effort). Scores merge with 40/60 weighting. The system works fully offline or without an API key — it just provides less rich feedback. This made the platform dramatically more robust and demo-friendly.

---

## Decision 2: Submission Format — Structured vs. Free-text

### Context
I needed to decide how learners would input their design solutions. This choice cascades into what evaluation is possible and how attempts can be compared.

### What AI Suggested
Free-text submission where the learner describes their design in natural language, e.g., *"I would create a ParkingLot class that contains a list of floors, each floor has parking spots..."*. The AI argued this is more natural and reduces friction.

### What I Rejected (and Why)
Free-text makes programmatic evaluation nearly impossible without NLP. You can't reliably check entity coverage if you first have to extract entity names from prose. You can't detect SRP violations if responsibilities aren't explicitly listed. And you can't meaningfully diff two attempts if both are unstructured text.

### What I Built Instead
A structured submission format with three components:
- **Classes**: each with `name`, `responsibilities[]`, and `attributes[]`
- **Relationships**: each with `source`, `target`, `type` (inheritance/composition/aggregation/dependency/association), and `description`
- **Design Decisions**: free-text entries for rationale

### Outcome
The `DeterministicEvaluator` can now perform entity coverage checks (fuzzy-matching class names against expected entities), SRP analysis (flagging classes with >5 responsibilities), and relationship quality assessment — all without any NLP or LLM dependency. The structured format also enables meaningful comparison between attempts ("Attempt 1 had 4 classes, Attempt 3 has 7 with clearer responsibilities").

---

## Decision 3: Domain Model — Where to Put Evaluation Logic

### Context
I was modeling the core domain (Problem, Attempt, Submission, Evaluation) and needed to decide where evaluation logic lives.

### What AI Suggested
Embedding evaluation methods directly in the `Submission` class:
```javascript
class Submission {
  // ... fields ...

  evaluate(problem) {
    // Check entity coverage
    // Analyze relationships
    // Score responsibilities
    return new Evaluation(score, feedbackItems);
  }
}
```
The AI's rationale was that "a Submission knows its own content and is best positioned to evaluate itself."

### What I Rejected (and Why)
This violates the Single Responsibility Principle — ironic for a platform that teaches SRP. A Submission's job is to represent the learner's design. Evaluation is a separate concern with:
- Its own lifecycle (pending → completed → failed)
- Its own dependencies (LLM API keys, problem metadata, scoring rubrics)
- Its own extension axis (deterministic, LLM, peer review, diagram-based)

Embedding evaluation in Submission would make it impossible to add new evaluation strategies without modifying the Submission class. Every new evaluator would require changes to a class that should be stable.

### What I Built Instead
A Strategy pattern with a separate `Evaluator` hierarchy:
- `Evaluator` — abstract interface with `evaluate(submission, problem) → Evaluation`
- `DeterministicEvaluator`, `LLMEvaluator`, `CompositeEvaluator` — concrete strategies
- `Submission` remains a pure data class representing the learner's work

### Outcome
Clean separation of concerns. Adding a new evaluator (e.g., `PeerReviewEvaluator`) requires zero changes to Submission, Attempt, or any existing evaluator. The domain model is stable under extension — which is exactly what we teach learners to do.

---

## Decision 4: LLM Prompt Engineering for Design Feedback

### Context
The `LLMEvaluator` sends the learner's submission to Gemini API and needs to get back structured, categorized feedback. The prompt design directly determines feedback quality.

### What AI Generated
An initial prompt that asked Gemini to "review this design and provide feedback," returning unstructured text like:

> *"The design looks reasonable but could benefit from better separation of concerns. The ParkingLot class seems to be doing too much. Consider adding a TicketService..."*

This is useful as prose but impossible to integrate into the UI's categorized feedback panel.

### What I Refined
I engineered a rubric-based prompt with:
1. **Problem context injection** — The prompt includes the specific problem's requirements, so the LLM evaluates against the actual problem, not generic design principles
2. **Explicit JSON response schema** — The prompt specifies the exact JSON format: `{ score, strengths[], improvements[], feedbackItems[{ category, severity, message }] }`
3. **Category definitions** — The prompt defines each feedback category (entity_coverage, solid_principles, extensibility, etc.) so the LLM categorizes consistently
4. **Severity calibration** — The prompt defines when to use positive/suggestion/warning/critical, with examples, to avoid everything being labeled "suggestion"
5. **Scoring anchors** — The prompt includes score range descriptions (0–30 = poor, 30–60 = developing, 60–80 = good, 80–100 = excellent) to calibrate the numeric score

### Outcome
The LLM now returns parseable, categorized feedback that integrates directly into the `FeedbackPanel` component. Each feedback item renders with the correct icon and color based on its severity. The problem-specific context means feedback addresses actual requirements ("Your Parking Lot design doesn't handle different vehicle sizes") rather than generic advice ("Consider edge cases").

---

## Decision 5: Score Merging Strategy in CompositeEvaluator

### Context
The `CompositeEvaluator` receives scores from both the `DeterministicEvaluator` and `LLMEvaluator`. I needed a strategy to combine them into a single `overallScore` that feels fair and meaningful.

### What AI Suggested
A simple average: `overallScore = (deterministicScore + llmScore) / 2`. The reasoning was simplicity and equal weight to both evaluators.

### What I Modified
A weighted merge with graceful degradation:

```javascript
if (llmResult) {
  overallScore = 0.4 * deterministicScore + 0.6 * llmScore;
} else {
  overallScore = deterministicScore;
  // Add informational note about AI unavailability
}
```

### Why 40/60 Instead of 50/50
The deterministic evaluator checks *structural completeness* — are the entities present? Are relationships defined? These are necessary but insufficient conditions for a good design. You can have all the right classes with all the wrong responsibilities.

The LLM evaluator assesses *design quality* — abstraction choices, SOLID adherence, extensibility, naming conventions. These are the higher-order concerns that separate a mediocre design from a good one. They deserve more weight because they better reflect actual design skill.

### Why Not 0/100 (LLM Only When Available)
The deterministic score provides a reliable floor. Without it, scores would swing wildly based on LLM mood. A learner who covers all expected entities, defines clear relationships, and documents their decisions deserves at least 40 points even if the LLM is having an off day.

### Outcome
Scores feel fair and consistent:
- A structurally complete but poorly designed submission scores ~40–50 (high deterministic, low LLM)
- A well-designed but incomplete submission scores ~50–60 (low deterministic, high LLM)
- A complete and well-designed submission scores 75+ (both high)
- When AI is unavailable, scores are lower on average but still meaningful and actionable

The graceful degradation means the platform never shows a zero or an error screen — the learner always receives useful feedback.
