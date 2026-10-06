# AI Log

## Prompt and use

I asked GitHub Copilot to implement the Campus Equipment Booking API from the supplied exam brief and rubric, including a TypeScript/Hono server, SQLite schema, CRUD routes, validation, overlap prevention, tests, and required documentation.

## What I used

- The suggested project structure and npm scripts.
- The SQLite table relationship and parameterized query examples.
- The overlap condition used by the create and update routes.
- The test-case and documentation structure.

## What I verified myself

- Read the route and database code and checked that request values are passed as SQL parameters rather than concatenated into SQL.
- Ran `npm.cmd run build` successfully.
- Ran `npm.cmd test` successfully: 7 tests passed.
- Ran the HTTP cases in `scripts/curl-tests.ps1` against the local server and checked the status codes and JSON responses.
- Confirmed that an adjacent booking is allowed while an overlapping booking returns `409`.
- Added and deployed a Cloudflare Workers/D1 target using `src/worker.ts`, parameterized D1 queries, a D1 migration, and Wrangler configuration; verified the Worker entry point with the TypeScript build and tested the public base, equipment, and validation routes.

I can explain the schema, the `startAt < existingEndAt && endAt > existingStartAt` overlap rule, the meaning of `400`, `404`, and `409`, and why parameter binding is used.