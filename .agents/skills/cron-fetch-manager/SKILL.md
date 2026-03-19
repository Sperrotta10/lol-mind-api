---
name: cron-fetch-manager
description: 'Experto en procesos en segundo plano (Cron Jobs) y consumo de APIs externas en Node.js. Use when creating or refactoring scheduled fetch scripts with native fetch, timeout control, resilient network error handling, retries, and non-blocking processing of very large arrays (for example Riot champions JSON).'
argument-hint: 'Que cron o script de fetch quieres implementar o mejorar?'
---

# Cron Fetch Manager

## Purpose
Design and maintain robust Node.js background jobs that fetch external API data on a schedule, fail safely, and avoid blocking the Event Loop when processing large payloads.

Default implementation target: Node.js 20+ with native `fetch`.

## Use This Skill When
- You are implementing a cron job that calls external APIs.
- You are migrating legacy HTTP clients (`axios`, `node-fetch`, etc.) to native `fetch`.
- You need explicit timeout, retry, and graceful error handling.
- You process large arrays (for example Riot champion datasets) and need to keep the app responsive.
- You want observability for scheduled tasks (duration, success/failure, records processed).

## Inputs You Should Collect First
- Source API endpoint(s), auth requirements, and expected response shape.
- Cron schedule and max allowed runtime per execution.
- Timeout budget per request.
- Retry policy (max attempts, backoff strategy, retryable status codes).
- Idempotency strategy (safe re-runs, duplicate protection).
- Dataset size expectations and memory constraints.

## Workflow
1. Define the job contract.
- Specify what data is fetched, transformed, and persisted.
- Define success criteria (for example: minimum records processed).
- Define failure criteria and fallback behavior.

2. Implement the scheduler wrapper.
- Trigger the job using a cron scheduler.
- Prevent overlapping executions with a job lock or in-memory guard.
- Track start/end time for each run.

3. Build a safe fetch layer using native `fetch`.
- Use `AbortController` for request timeout.
- Validate HTTP status and parse body safely.
- Normalize transient errors into retryable/non-retryable categories.

4. Add retry with bounded backoff.
- Retry only for network errors, timeouts, and selected 5xx/429 responses.
- Use exponential backoff with jitter.
- Stop retries after max attempts and emit structured failure logs.

5. Process large arrays without blocking the Event Loop.
- Avoid single huge synchronous loops on very large payloads.
- Process in chunks/batches and yield between chunks (`setImmediate`/timers).
- Keep transformation pure and storage writes batched.

6. Persist data with idempotent semantics.
- Use upsert or merge strategies when possible.
- Keep writes atomic per chunk when practical.
- Record checkpoints or cursors for resumable runs when supported.

7. Add observability and run summary.
- Log: run id, duration, retries, records fetched, records saved, error type.
- Expose metrics if available (success count, failure count, p95 duration).
- Return a compact result object for monitoring.

## Decision Points
- If the API returns `429` or rate-limit headers:
1. Respect `Retry-After` when present.
2. Slow down concurrency and retry with backoff.

- If timeout is reached:
1. Abort request with `AbortController`.
2. Retry only if attempt budget remains.
3. Mark run as partial/failed with explicit reason.

- If payload is larger than expected:
1. Switch to chunked processing immediately.
2. Reduce in-memory copies.
3. Save intermediate progress more frequently.

- If downstream DB is unavailable:
1. Stop write phase safely.
2. Keep fetched data checkpoint metadata (not full payload unless required).
3. Exit with retriable failure status.

## Quality Gates (Completion Checks)
- Uses Node native `fetch` (no external HTTP client unless explicitly required).
- Request timeout is implemented with `AbortController`.
- Retry policy is explicit and bounded.
- Large-array processing yields to Event Loop between chunks.
- Job cannot overlap accidentally (concurrency guard).
- Structured logs include timing, attempts, and processed counts.
- At least one test covers each key scenario:
1. Successful run.
2. Timeout + retry path.
3. Non-retryable error path.
4. Large payload chunked processing path.

## Suggested Implementation Pattern
- `runCronFetchJob()`
- `withJobLock(jobName, fn)`
- `fetchWithTimeout(url, options, timeoutMs)`
- `fetchWithRetry(request, retryPolicy)`
- `processInChunks(items, chunkSize, worker)`
- `persistBatch(batch)`
- `buildRunSummary(stats)`

## Native Fetch Notes (Node.js)
- Use `AbortController` per request and clear timeout handles.
- Check `response.ok` and include status/body snippet in errors.
- Avoid unbounded parallel fetches; cap concurrency.
- Keep request/response logging sanitized (never log secrets/tokens).

## Anti-Patterns to Avoid
- Infinite retries without a hard cap.
- One giant blocking loop over huge arrays.
- Swallowing network errors without context.
- Overlapping cron runs that race each other.
- Treating all errors as retryable.

## Done Criteria
This workflow is complete when:
- Cron execution is deterministic and non-overlapping.
- Fetch logic is timeout-aware and retry-safe.
- Large payload processing remains Event Loop friendly.
- Operational visibility is sufficient to diagnose failures quickly.
