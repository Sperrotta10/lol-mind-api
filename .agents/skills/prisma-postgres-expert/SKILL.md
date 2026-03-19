---
name: prisma-postgres-expert
description: 'Expert workflow for Prisma Postgres setup, database provisioning, connection configuration, migration lifecycle, drift recovery, Prisma Studio inspection, and safe dev-vs-production decisions. Use when creating or maintaining Prisma Postgres databases and schema migrations.'
argument-hint: 'What do you need: setup, migrate, drift-fix, inspect, or troubleshoot?'
user-invocable: true
---

# Prisma Postgres Expert

End-to-end workflow for creating and operating Prisma Postgres databases with safe migration practices.

## When to Use

- Starting a new project that needs Prisma Postgres
- Connecting an app to an existing Prisma/Postgres database
- Creating and applying schema migrations in development
- Diagnosing migration drift or failed migrations
- Inspecting data with Prisma Studio
- Preparing safe handoff guidance for production migration workflows

## Outcomes

- Database access is configured correctly
- `DATABASE_URL` is valid and reachable
- Prisma schema and database are in sync
- Migration history is clean and understandable
- Drift is handled with explicit safety checks

## Workflow

1. Establish context and safety boundaries.
2. Provision or connect to a database.
3. Validate Prisma configuration and connectivity.
4. Run migration workflow based on detected state.
5. Verify schema/data state and summarize next actions.

## Step-by-Step Procedure

### 1) Context and Safety Gate

1. Confirm environment target: `development`, `staging`, or `production`.
2. If reset/destructive operations are requested, explicitly require development-only confirmation.
3. Determine if user needs a new database or wants to connect an existing one.

Completion checks:
- Target environment is explicit.
- Destructive risk is acknowledged before reset operations.

### 2) Provision or Connect Database

1. If no database exists:
	 - Log in to Prisma platform.
	 - Create Prisma Postgres database with a meaningful name and region.
2. If database already exists:
	 - Obtain connection string securely from existing provider.
3. Set `DATABASE_URL` in project environment file.

Decision branch:
- If Prisma workspace plan limit is reached, provide alternatives:
	- Use an existing database connection string.
	- Upgrade plan.
	- Delete unused Prisma database projects.

Completion checks:
- `DATABASE_URL` exists and points to intended database.
- Connection source (new vs existing) is documented in summary.

### 3) Validate Prisma Project State

1. Ensure `prisma/schema.prisma` exists and datasource provider is correct (`postgresql`).
2. Check migration status to identify pending migrations and drift.
3. Identify whether schema changed since last migration.

Decision branch:
- No drift, no pending changes: proceed to verification.
- Pending local schema changes: create a new descriptive migration.
- Drift/history mismatch: use drift recovery path (Step 4C).

Completion checks:
- Current migration state is known.
- Next action path is selected (4A, 4B, or 4C).

### 4A) Normal Migration Path (Development)

1. Generate/apply migration with a descriptive name.
2. Confirm migration applied successfully.
3. Confirm generated Prisma artifacts are up to date.

Quality criteria for migration names:
- Reflect schema intent, e.g. `add-user-profile-fields`.
- Avoid generic names like `update` or `changes`.

Completion checks:
- New migration folder exists.
- Migration applied successfully.
- Client generation artifacts are updated.

### 4B) Pending Migration Apply Path

1. Apply pending migrations to development database.
2. Re-check migration status.

Completion checks:
- No pending migrations remain.
- Schema and migration table agree.

### 4C) Drift Recovery Path (Development Only)

1. Explain drift findings clearly (last common migration, missing local/db entries).
2. Prefer non-destructive reconciliation first when feasible.
3. If reset is required, require explicit confirmation and execute development reset only.
4. Re-apply migrations and reseed if configured.

Decision branch:
- Production/staging target: do not reset; provide safe manual/CI migration plan.
- Development target with confirmation: allow reset workflow.

Completion checks:
- Drift state resolved.
- Post-reset schema matches migration history.

### 5) Verify and Inspect

1. Run migration status again to verify clean state.
2. Optionally open Prisma Studio to validate records and relationships.
3. Provide concise summary:
	- What changed
	- What commands/tools were run
	- Any risks and follow-up actions

Completion checks:
- Final status is clean or explicitly documented with blocker.
- User receives actionable next steps.

## Tooling Preferences

Prefer Prisma MCP tools when available for reliability and guided flows:

- `prisma-platform-login`
- `prisma-postgres-create-database`
- `prisma-migrate-status`
- `prisma-migrate-dev`
- `prisma-migrate-reset` (development only)
- `prisma-studio`

If MCP tools are unavailable, use equivalent Prisma CLI commands with the same safety gates.

## Production Handoff Guidance

Use this section when the user asks for production readiness or deployment strategy.

1. Do not run reset workflows in production.
2. Generate and validate migrations in development first.
3. Apply migrations in CI/CD using a controlled release step.
4. Require backup and rollback plan before production migration.
5. Record migration ID, deployment timestamp, and operator in release notes.

Completion checks:
- Production plan excludes destructive reset.
- Migration application path is automated or explicitly documented.
- Rollback expectations are defined before execution.

## Troubleshooting Playbook

- Invalid `DATABASE_URL`:
	- Check env file loading and URL format.
	- Verify network/firewall and credentials.
- Drift detected repeatedly:
	- Ensure teammates did not rewrite/delete migrations.
	- Pull latest migration files before creating new ones.
- Migration fails on apply:
	- Inspect migration SQL and conflicting schema state.
	- Resolve conflicts, then re-run status and migration.

## Done Criteria

- Environment target confirmed.
- Database connection validated.
- Migration state reconciled.
- Drift handled safely (no unsafe reset outside development).
- User receives a final state summary with next steps.
