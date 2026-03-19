---
name: gemini-rag-integrator
description: 'Integrate Gemini API with the RAG pattern using structured context injection. Use when implementing AI backend functions that clearly separate System Prompt, Context (database items/champions), and User Prompt, with token-efficient prompts and quality validation.'
argument-hint: 'Que flujo o endpoint RAG con Gemini quieres implementar?'
---

# Gemini RAG Integrator

## Purpose
Build and maintain Gemini-powered RAG flows where prompt construction is explicit, modular, and token-aware.

Default implementation target: Node.js + TypeScript (Express or Fastify).

## Use This Skill When
- You are creating or refactoring backend functions that call Gemini.
- You need retrieval-augmented generation using structured data from your database.
- You want predictable prompt behavior by separating:
1. `systemPrompt`: behavior rules and output policy.
2. `contextBlock`: retrieved entities (for example, items and champions).
3. `userPrompt`: the user question.
- You need to reduce token usage while preserving answer quality.

## Inputs You Should Collect First
- User question and language requirements.
- Retrieval scope (which entities/tables to search: items, champions, or both).
- Top-k and ranking logic for retrieval.
- Output format requirements (plain text, JSON, bullets, etc.).
- Safety and refusal policy for unsupported or unknown answers.

Default expected output: structured JSON with stable keys.

## Workflow
1. Define output contract before coding.
- Specify the exact response shape the function must return.
- Decide whether citations, IDs, or source labels are required.
- Prefer a typed JSON response contract for API consistency.

2. Implement retrieval as a separate step.
- Fetch relevant records from the database based on the user intent.
- Normalize records into a compact structure with only fields needed for generation.
- Prefer deterministic ordering by relevance score.

3. Build prompt segments independently.
- Create `systemPrompt` with stable behavior instructions only.
- Create `contextBlock` from retrieved records only (no policy instructions).
- Create `userPrompt` from the raw user question and explicit task.

4. Assemble the final Gemini input in fixed order.
- Always compose as: `systemPrompt` -> `contextBlock` -> `userPrompt`.
- Keep separators explicit and consistent to avoid instruction leakage.

5. Apply token-budget controls.
- Trim context fields aggressively (drop unused attributes).
- Cap the number of retrieved entities.
- If context exceeds budget, summarize low-priority records first.

6. Call Gemini through a single integration function.
- Keep model configuration centralized (temperature, max tokens, safety settings).
- Log request metadata (not sensitive raw content) for observability.

7. Post-process and validate output.
- Enforce output schema/format.
- Apply strict grounding: reject any claim not grounded in `contextBlock`.
- Return fallback response when grounding confidence is low.

## Decision Points
- If retrieval returns no relevant records:
1. Return a controlled fallback and ask a clarifying question.
2. Do not fabricate facts.

- If retrieval quality is weak:
1. Retry retrieval with broader query expansion or alternate filters.
2. Lower generation creativity and require stricter grounding.

- If prompt length exceeds token budget:
1. Reduce `topK`.
2. Keep only high-impact fields in `contextBlock`.
3. Summarize context before final generation.

- If user asks outside available domain:
1. State scope limitations explicitly.
2. Offer nearest supported guidance.

## Quality Gates (Completion Checks)
- Prompt separation is explicit in code (`systemPrompt`, `contextBlock`, `userPrompt`).
- No behavioral instructions are embedded in `contextBlock` data.
- Context is sourced from retrieval results and is traceable.
- Prompt remains concise and within token targets.
- Empty or low-confidence retrieval paths return safe fallback responses.
- At least one test covers each scenario:
1. Strong retrieval + grounded answer.
2. No retrieval result.
3. Token overflow mitigation.
4. Out-of-scope user question.

## Suggested Implementation Pattern
- `buildSystemPrompt()`
- `retrieveContext(query)`
- `buildContextBlock(retrievedData)`
- `buildUserPrompt(userQuestion)`
- `composeGeminiPrompt({ systemPrompt, contextBlock, userPrompt })`
- `generateWithGemini(composedPrompt, modelConfig)`
- `validateGrounding(response, contextBlock)`

## TypeScript Integration Notes
- Keep retrieval and generation in separate service modules.
- Define interfaces for context entities (for example `ChampionContext`, `ItemContext`).
- Define a response DTO for strict JSON output and validate before returning.
- Keep provider configuration in one place (model, temperature, token limits, safety config).

## Anti-Patterns to Avoid
- Mixing user question inside `systemPrompt`.
- Embedding policy/instructions inside retrieved context data.
- Passing full database rows without field pruning.
- Using verbose prompts that waste tokens.
- Returning ungrounded answers when context is missing.

## Done Criteria
This workflow is complete when:
- The integration function uses strict prompt separation.
- Retrieval-to-generation flow is observable and testable.
- Fallback behavior is deterministic.
- Output quality is grounded in retrieved context and stays concise.
