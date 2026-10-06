# Quality Gate Review

## Pre-30-minute snapshot

The first working snapshot contained the database schema, seeded equipment, CRUD routes, validation, overlap checks, and automated tests. The supplied snapshot shows six passing tests and the API starting on port 8787; the final suite contains seven tests after adding the CORS test.

## Findings and fixes

| Quality Gate area | Finding | Action taken | Evidence |
| --- | --- | --- | --- |
| Reliability/Accuracy | The API needed to enforce the same overlap rule during updates, not only creates. | Added an update conflict query that excludes the current booking ID. | The `PATCH` route uses `start_at < ? AND end_at > ? AND id <> ?`; the update-conflict test passes. |
| Implementation/Security | Request data must not be concatenated into SQL. | Used `?` placeholders for IDs, dates, and all booking values. | Request-dependent SQL in `src/app.ts` uses `.get(...)` or `.run(...)` parameters. |
| Testing/Accuracy | Happy-path tests alone would not demonstrate the rubric's error behavior. | Added tests and HTTP cases for invalid times, conflicts, not-found records, update, and delete. | Seven automated tests pass; the evidence script covers all nine guide cases. |
| Reasoning/You Own It | Design assumptions needed to be explicit. | Documented status-code meanings, the adjacent-booking boundary rule, the ERD, and verification steps. | `API_CONTRACT.md`, `SCHEMA.md`, and `AI_LOG.md` record the decisions. |

## Submission Decision

**READY**, provided the student reviews the AI log, runs the final commands, and can explain the implementation in their own words.