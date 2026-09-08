# Research Note — LLD Practice Platform

## 1. The Learner Problem

Low-Level Design (LLD) is a core competency tested in software engineering interviews and expected in day-to-day engineering work. Learners are asked to design systems — a Parking Lot, an Elevator System, a Vending Machine — by decomposing requirements into classes, defining relationships, assigning responsibilities, and making defensible design decisions.

**Starting is easy. Knowing if your design is good is hard.**

A learner can sketch out a `ParkingLot` class with a list of `ParkingSpot` objects in under five minutes. But fundamental questions remain unanswered:

- Are the class responsibilities well-separated, or is there a god class hiding?
- Are the relationships (composition vs. aggregation vs. inheritance) appropriate?
- Does the design adhere to SOLID principles, or does it violate Open-Closed by hard-coding vehicle types?
- Are important entities missing entirely — a `Ticket`, a `PaymentProcessor`, an `EntryPanel`?
- Would this design survive a real interview, or would it fall apart under follow-up questions?

Without structured feedback, learners oscillate between two failure modes: **false confidence** (thinking a surface-level design is sufficient) and **analysis paralysis** (endlessly second-guessing without a rubric to evaluate against). Both waste time and stall improvement.

---

## 2. Existing Approaches Researched

We surveyed the current landscape of LLD learning resources and tools. Each addresses part of the problem, but none closes the full feedback loop.

| Approach | Format | Strengths | Limitations |
|---|---|---|---|
| **LLDCoding.com** | Browser IDE with test cases | Tests code correctness; real execution environment | Evaluates whether code *runs*, not whether the *design* is good. A design can pass all tests while violating SRP or missing key abstractions. |
| **Hello Interview** | Guided walkthroughs with worked solutions | Well-structured explanations; covers interview context | Entirely passive. The learner reads a solution — they don't practice producing one. No feedback on *their* design. |
| **GitHub "Awesome LLD" repos** | Curated problem lists + reference solutions | Comprehensive problem coverage; community-maintained | No feedback mechanism. Learner must manually compare their solution against the reference and identify gaps themselves — a skill they haven't yet developed. |
| **CodeChef LLD modules** | MCQs and short coding tasks | Tests factual knowledge (e.g., "Which SOLID principle does this violate?") | Tests recognition, not generation. Knowing the name of a principle ≠ applying it in a design. |
| **AI chatbots (ChatGPT, Claude)** | Conversational; accepts free-text design descriptions | Can give rich, contextual feedback when prompted well | No structured practice loop. No history. No scoring consistency. Quality depends entirely on the learner's ability to prompt effectively — a bootstrapping problem. |

### Key Observation

Every existing approach fails on at least one axis of the **practice loop**:

```
Attempt → Submit → Get design-level feedback → Review → Iterate
```

- **LLDCoding.com** has Attempt → Submit → Feedback, but feedback is code-correctness, not design-quality.
- **Hello Interview** has no Attempt step — it's consumption, not practice.
- **GitHub repos** have Attempt but no Submit or Feedback — it's self-serve comparison.
- **CodeChef** tests knowledge recall, not design generation.
- **AI chatbots** can provide feedback, but with no structure, no history, and no consistency.

---

## 3. Key Gaps Identified

Three critical gaps emerge from this analysis:

### Gap 1: No full practice loop exists
No existing tool implements the complete cycle: *attempt → submit structured design → receive design-level feedback → review → iterate on the same problem*. Learners either consume content passively or practice without feedback.

### Gap 2: No hybrid evaluation (deterministic + AI)
Tools either test code correctness (deterministic, but not design-aware) or offer AI conversation (design-aware, but inconsistent and unstructured). No tool combines **fast, reliable structural checks** (entity coverage, relationship analysis) with **rich, qualitative AI feedback** (SOLID adherence, abstraction quality, extensibility).

### Gap 3: No attempt history or improvement tracking
Even when learners do iterate on a design, no tool tracks their progression. There's no way to see: "Your first attempt scored 45/100 and missed 3 key entities. Your third attempt scored 78/100 with better responsibility separation." This visibility is essential for motivation and directed improvement.

---

## 4. Our Product Direction

Based on these gaps, we define the following product direction for the LLD Practice Platform:

### Focus: The learner journey, not the LMS
We are not building a course platform. We are building a **practice tool** — a focused environment where a learner picks a problem, designs a solution, submits it in a structured format, and receives meaningful feedback. The unit of value is the **feedback on a single attempt**, not a curriculum.

### Structured submission format enables evaluation
The core insight: by asking learners to submit their design in a structured format — **classes** (with responsibilities and attributes), **relationships** (with types like composition, inheritance, dependency), and **design decisions** (free-text rationale) — we make the submission machine-readable. This enables both:

- **Deterministic evaluation**: entity coverage scoring, relationship analysis, SRP checks, completeness metrics
- **AI evaluation**: structured input produces more consistent, rubric-aligned LLM output than free-text

### Two-layer evaluation for robustness
The evaluation pipeline has two layers:

1. **Deterministic Evaluator** — Rule-based, instant, always available. Checks structural properties: Are the expected entities present? Are relationships defined? Are responsibilities assigned and reasonably scoped? Produces a reliable baseline score (0–100).

2. **LLM Evaluator** — Sends the structured submission + problem requirements to Gemini API with a rubric-based prompt. Returns qualitative feedback on abstraction quality, SOLID adherence, extensibility, naming conventions, and missing edge cases. Richer but may fail (API errors, rate limits).

The **Composite Evaluator** orchestrates both: deterministic runs first (always), LLM runs second (best-effort). Scores are merged with appropriate weighting. If LLM fails, the system degrades gracefully to deterministic-only feedback — the learner always gets *something* useful.

### Attempt history for visible progress
Every submission is persisted as an `Attempt` with its `Evaluation`. Learners can review their history for a problem, see score progression, and compare feedback across attempts. This closes the motivation loop: improvement becomes visible and concrete.

---

## References

- LLDCoding.com — https://www.lldcoding.com
- Hello Interview — https://www.hellointerview.com
- Awesome LLD (GitHub) — https://github.com/ashishps1/awesome-low-level-design
- CodeChef Learn — https://www.codechef.com/learn
- Google Gemini API — https://ai.google.dev
