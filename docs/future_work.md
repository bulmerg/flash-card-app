Add an "Explain" (or "Go deeper") capability to study cards.

==================================================
GOAL
==================================================

Allow users to get a deeper explanation of a concept
WITHOUT bloating the core card content.

==================================================
UI BEHAVIOR
==================================================

In Study Mode:

After revealing the answer:
- add a subtle button:
  → "Explain this deeper"

When clicked:
- expand a panel below the card
- generate a deeper explanation using AI

==================================================
EXPLANATION SHOULD INCLUDE
==================================================

- plain-English explanation
- why the concept exists
- simple example
- optional analogy

This should be:
- beginner-friendly
- not just a rewording of the answer

==================================================
DATA
==================================================

Use existing card fields as context:
- front
- back
- why
- when
- tradeoffs
- trap
- scenario

No new CSV fields required.

==================================================
IMPORTANT
==================================================

Do NOT:
- modify CSV schema
- persist explanation in storage (optional later)
- slow down initial card rendering

This is an on-demand feature.

==================================================
DELIVERABLE
==================================================

1. "Explain this" button in Study Mode
2. expandable explanation panel
3. AI-generated deeper explanation
4. clean UI that does not clutter default card view