## InterviewForge – New Question Generation Prompt

You will be given existing CSV rows for a topic.

### EXISTING CONTENT (SOURCE OF TRUTH)
- Treat the provided CSV as the complete set of already-covered questions
- DO NOT generate:
  - duplicate questions
  - reworded versions of existing questions
  - same concept tested in a slightly different way

- Instead:
  - identify gaps in coverage
  - generate NEW concepts not already represented

---

### GOAL:
Create high-quality, interview-level questions that focus on **how to implement solutions**, not just what they are.

---

### REQUIREMENTS:

#### 1. Front (Question)
- Must be realistic interview-style
- Must require explanation, not recall
- Should focus on implementation, tradeoffs, or design decisions

#### 2. Back (Answer)
- Must include WHAT + HOW + WHY
- Should sound like a strong spoken answer
- Avoid generic statements

#### 3. Why
- Must clearly explain real-world importance
- Tie to failure modes, scaling limits, or system risk

#### 4. When
- When to use this approach in real systems

#### 5. Tradeoffs
- Concrete pros vs cons
- Include cost, complexity, latency, consistency, etc.

#### 6. Trap (CRITICAL)
Must include:
- the mistake
- why it’s wrong
- what happens if you do it

#### 7. Scenario
- Short real-world example where this applies

#### 8. Tags
- Must follow rules:
  - 1 primary tag (REQUIRED)
  - 0–2 secondary tags (OPTIONAL)

**Allowed primary tags:**
- react, angular, java, spring, sql, database
- system-design, distributed-systems, aws
- api, networking, security, concurrency, architecture

**Allowed secondary tags:**
- performance, transactions, caching, scaling, consistency, reliability

#### 9. IntrinsicDifficulty
- 1–5 scale
- Prioritize 3–5

---

### QUALITY RULES:
- Focus on **implementation depth**
- Avoid vague answers
- Each section must go one level deeper than surface knowledge
- No fluff
- No long paragraphs
- No duplicates

---

### OUTPUT FORMAT (STRICT):
- Output ONLY CSV rows
- DO NOT include headers
- DO NOT include explanations
- Wrap output in a `<csv>` block for easy copying