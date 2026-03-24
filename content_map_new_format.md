# InterviewForge Content Map (v3)

This file tracks all generated content for CSV-based study decks.

==================================================
CORE STRATEGY
==================================================

- ONE CSV file per main topic
- Subtopics define internal coverage
- Cards are generated in batches (30–50 at a time)
- Each topic should eventually contain 150–250 cards

Do NOT create separate files per subtopic.

==================================================
CSV FORMAT (REQUIRED)
==================================================

"Front","Back","Why","When","Tradeoffs","Trap","Scenario","Topic","Subtopics","IntrinsicDifficulty"

Rules:
- Topic = exactly ONE main topic
- Subtopics = comma-separated (0–3 max)
- No free-form tags
- No vague labels like "basics"

==================================================
STATUS LEGEND
==================================================

- todo → not started
- in-progress → actively generating
- done → sufficient depth (150+ high-quality cards)

==================================================
MAIN TOPICS
==================================================

- database
- system-design
- distributed-systems
- api
- concurrency
- architecture
- react
- angular
- java
- spring
- aws
- networking
- security

==================================================
CONTROLLED SUBTOPICS
==================================================

database:
- indexing
- query-optimization
- transactions
- schema-design
- normalization
- denormalization
- joins
- performance
- scaling
- internals

system-design:
- scalability
- availability
- latency
- throughput
- load-balancing
- caching
- rate-limiting
- backpressure
- fault-tolerance
- redundancy

distributed-systems:
- consistency
- replication
- partitioning
- consensus
- leader-election
- messaging
- ordering
- idempotency

api:
- rest
- versioning
- contracts
- idempotency
- pagination
- rate-limiting

concurrency:
- threading
- locking
- synchronization
- deadlocks
- race-conditions
- parallelism

architecture:
- patterns
- layering
- coupling
- cohesion
- modularity

react:
- rendering
- state
- hooks
- performance
- reconciliation

angular:
- change-detection
- rxjs
- dependency-injection

java:
- memory
- collections
- concurrency

spring:
- dependency-injection
- transactions
- configuration

aws:
- compute
- storage
- networking
- scaling
- event-driven

networking:
- http
- tcp
- udp
- latency
- throughput

security:
- authentication
- authorization
- encryption
- vulnerabilities

==================================================
CONTENT TRACKING
==================================================

# DATABASE

File: database.csv  
Status: in-progress  

Subtopics:
- indexing (done)
- query-optimization (done)
- transactions (done)
- schema-design (done)
- normalization (done)
- denormalization (done)
- joins (done)
- performance (done)
- scaling (done)
- internals (done)
- consistency (done)
- concurrency (done)

---

# SYSTEM DESIGN

File: system_design.csv  
Status: done  

Subtopics:
- scalability (done)
- availability (done)
- latency (done)
- throughput (done)
- load-balancing (done)
- caching (done)
- rate-limiting (done)
- backpressure (done)
- fault-tolerance (done)
- redundancy (done)

---

# DISTRIBUTED SYSTEMS

File: distributed-systems.csv  
Status: todo  

Subtopics:
- consistency
- replication
- partitioning
- consensus
- leader-election
- messaging
- ordering
- idempotency

---

# BACKEND / API

File: api.csv  
Status: todo  

Subtopics:
- rest
- versioning
- contracts
- idempotency
- pagination
- rate-limiting

---

# CONCURRENCY

File: concurrency.csv  
Status: todo  

Subtopics:
- threading
- locking
- synchronization
- deadlocks
- race-conditions
- parallelism

---

# ARCHITECTURE

File: architecture.csv  
Status: todo  

Subtopics:
- patterns
- layering
- coupling
- cohesion
- modularity

---

# REACT

File: react.csv  
Status: todo  

Subtopics:
- rendering
- state
- hooks
- performance
- reconciliation

---

# ANGULAR

File: angular.csv  
Status: todo  

Subtopics:
- change-detection
- rxjs
- dependency-injection

---

# JAVA

File: java.csv  
Status: todo  

Subtopics:
- memory
- collections
- concurrency

---

# SPRING

File: spring.csv  
Status: todo  

Subtopics:
- dependency-injection
- transactions
- configuration

---

# AWS

File: aws.csv  
Status: todo  

Subtopics:
- compute
- storage
- networking
- scaling
- event-driven

---

# NETWORKING

File: networking.csv  
Status: todo  

Subtopics:
- http
- tcp
- udp
- latency
- throughput

---

# SECURITY

File: security.csv  
Status: todo  

Subtopics:
- authentication
- authorization
- encryption
- vulnerabilities

==================================================
RULES (STRICT)
==================================================

- No duplicate questions across batches
- No cross-topic leakage
- Each card must map cleanly to ONE topic
- Max 3 subtopics per card
- Follow +1 depth rule
- Interview traps must include:
  - mistake
  - why it’s wrong
  - consequence

==================================================
WORKFLOW
==================================================

1. Pick a topic (e.g., database)
2. Pick 2–3 subtopics
3. Generate 30–50 cards
4. Append to the topic CSV
5. Mark subtopics as partial/done
6. Repeat until topic is complete

==================================================
GOAL
==================================================

A deep, structured, high-signal dataset that:

- feels organized in the UI
- avoids noisy tagging
- supports powerful filtering
- teaches real engineering thinking
- holds up for senior-level interviews