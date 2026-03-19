---
name: swagger-api-docs
description: 'Experto en documentacion de APIs REST con OpenAPI 3.0 y Swagger-UI en Node.js + TypeScript. Use when creating or refactoring routes/controllers and you need mandatory JSDoc annotations (@swagger/@openapi), complete request/response docs, and schema alignment with Prisma models.'
argument-hint: 'Que endpoint o controlador quieres documentar con OpenAPI 3.0?'
---

# Swagger API Docs

## Purpose
Create and maintain high-quality OpenAPI 3.0 documentation (Swagger-UI compatible) directly in code comments for every new route or controller in Node.js + TypeScript projects.

Primary requirement: every generated endpoint must include JSDoc annotations (`@swagger` or `@openapi`) above the route/controller implementation.

## Use This Skill When
- You add a new REST endpoint.
- You modify request/response shape in a controller.
- You refactor Prisma models and must keep API docs in sync.
- You need consistent Swagger docs for body, query, params, success response, and common errors.

## Inputs You Should Collect First
- HTTP method and path (`GET /users/{id}`, `POST /items`, etc.).
- Business summary of the endpoint.
- Expected inputs:
1. Path params.
2. Query params.
3. Request body schema.
- Prisma model(s) involved and final response shape.
- Common validation and runtime failure modes (`400`, `500`, and others if needed).

## Workflow
1. Define the endpoint contract before writing comments.
- Confirm method, route, purpose, and auth requirements.
- Identify exact input fields and which are required.
- Map output fields from Prisma-backed DTOs.

2. Add JSDoc OpenAPI block above the route/controller.
- Use `@swagger` or `@openapi` consistently with project convention.
- Include `summary` and, when useful, `description`.
- Add `tags` for discoverability.

3. Document request inputs completely.
- `parameters` for `path` and `query` values.
- `requestBody` for JSON payloads.
- Mark required fields explicitly.
- Provide realistic examples.

4. Document successful response (`200` by default).
- Include `description` of success behavior.
- Define response schema under `content.application/json.schema`.
- Add a concrete `example` matching actual controller output.
- Use the real success status code from implementation (`200`, `201`, `204`, etc.).

5. Document common errors.
- Always include `400` and `500`.
- Use a consistent error payload structure: `{ success, message, details }`.
- Keep error examples consistent with global error handler format.

6. Validate Prisma alignment.
- Ensure field names, nullability, enums, and nested relations match Prisma outputs.
- If API uses DTO transformations, document the final DTO shape, not raw DB internals.
- Update shared component schemas when model structure changes.

7. Reuse schemas with `components/schemas` when possible.
- Extract repeated request/response structures to reusable components.
- Reference them using `$ref` to avoid duplication and drift.

8. Verify rendering and consistency.
- Confirm Swagger-UI renders without parsing errors.
- Confirm referenced schemas exist.
- Confirm examples are valid JSON.

## Decision Points
- If endpoint returns `201` instead of `200`:
1. Document real status code used by controller.
2. Keep `200` only when truly applicable.

- If endpoint has no body (for example simple `GET`):
1. Omit `requestBody`.
2. Fully document `query`/`path` params.

- If Prisma model has sensitive fields (`passwordHash`, tokens):
1. Exclude them from documented response schema.
2. Document only sanitized DTO fields.

- If endpoint can return domain-specific errors (`404`, `409`, `422`):
1. Include them in addition to `400` and `500`.
2. Provide example payloads for each.

## Quality Gates (Completion Checks)
- Endpoint has JSDoc OpenAPI annotation directly above implementation.
- `summary` is present and specific.
- Inputs are fully documented (`params`, `query`, `body` as applicable).
- Success response includes schema + JSON example.
- `400` and `500` responses are documented with `{ success, message, details }` examples.
- Schema aligns with Prisma-backed response/DTO shape.
- Swagger-UI renders endpoint without broken refs.
- Repeated structures are moved to `components/schemas` and referenced via `$ref`.

## Suggested OpenAPI Comment Skeleton
```ts
/**
 * @openapi
 * /resource/{id}:
 *   get:
 *     summary: Get one resource by id
 *     tags: [Resource]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource identifier
 *       - in: query
 *         name: includeDetails
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Include related details
 *     responses:
 *       200:
 *         description: Resource fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *             example:
 *               id: "clx123"
 *               name: "Sample"
 *               createdAt: "2026-03-19T10:30:00.000Z"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *             example:
 *               success: false
 *               message: "Validation error"
 *               details: ["id must be a UUID"]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *             example:
 *               success: false
 *               message: "Unexpected error"
 *               details: ["Unhandled exception"]
 */
```

## Prisma Alignment Notes
- Prefer documenting DTO contracts derived from Prisma models.
- Keep enum values synchronized with Prisma enums.
- For nullable Prisma fields, use `nullable: true` in OpenAPI schema where applicable.
- For relations, document only what the endpoint really includes (avoid implying eager-loaded fields that are not returned).

## Reuse Strategy (`components/schemas`)
- If the same object shape appears in 2 or more endpoints, extract it to `components/schemas`.
- Reuse request and response schemas with `$ref` to keep docs maintainable.
- Keep component names stable and explicit (for example `ChampionResponse`, `CreateItemRequest`).

## Anti-Patterns to Avoid
- Creating endpoints without OpenAPI JSDoc blocks.
- Generic summaries like "Get data".
- Mismatch between documented schema and real JSON output.
- Missing `400`/`500` responses.
- Inconsistent error payloads across endpoints.
- Examples that are not valid JSON.

## Done Criteria
This skill is complete when every new or modified endpoint includes accurate, renderable, and Prisma-aligned OpenAPI documentation with request inputs, success schema/example, and common error responses.
