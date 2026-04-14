# Development Audit Log (MemeGenAI)

This log tracks all major design decisions, architectural rationale, and engineering steps taken as the MVP is transitioned into a full-stack, production-ready master's level project.

## [Date: 2026-04-12] Project Initialization & Planning
- **Decision:** Identified the necessity for an overarching MVC architecture (Next.js frontend, FastAPI backend, Supabase persistence).
- **Rationale:** A master's level deployment requires a robust UI decoupled from backend logic. Using Next.js allows flexible client/server routing, easy hydration of components, and rich user interactions.
- **Action:** Scaffolded the Development Log and initialized `task.md`.

## [Date: 2026-04-12] Technology Stack Validation
- **Decision:** Select Supabase for Postgres & Vector Storage (`pgvector`).
- **Rationale:** The application features a Semantic Template Retrieval engine. Vector cosine similarity queries are significantly faster and more scalable inside Postgres with `pgvector` compared to runtime in-memory mathematical computation.
- **Action:** Created `supa_schema.sql` utilizing `vector(768)` fields, developed `seed_db.py`, and refactored `template_retrieval.py` to use `client.rpc()`.

## [Date: 2026-04-12] Contextual Refinement Architecture
- **Decision:** Implement a stateful mechanism to inject user feedback on past generations back into the prompt context via `refine_feedback`.
- **Rationale:** True interactive AI systems don't just generate, they refine. Adding a "Refine" loop elevates the MVP into an interactive workspace.
- **Action:** Updated `caption_generation.py` to accept the feedback and injected it dynamically as a `CRITICAL INSTRUCTION` in the prompt, rendering a refined visual output via Next.js UI integration.
