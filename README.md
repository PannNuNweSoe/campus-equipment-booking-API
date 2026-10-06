# Campus Equipment Booking API

TypeScript/Hono API for reserving shared campus equipment. It uses local SQLite through `better-sqlite3` and seeds two equipment records on first start.

## Run

Requirements: Node.js 20 or newer.

```powershell
npm.cmd install
npm.cmd run build
npm.cmd test
npm.cmd start
```

The API runs at `http://localhost:8787/api`. The database is created at `data/campus-booking.db`.

Browser clients served from `http://localhost:3000` or `http://localhost:5173` are allowed by CORS, so a provided frontend tester can call the API directly.

## Endpoints

- `GET /api/equipment` lists equipment.
- `GET /api/bookings` lists bookings.
- `GET /api/bookings/:id` gets one booking.
- `POST /api/bookings` creates a booking and returns `201`.
- `PATCH /api/bookings/:id` partially updates a booking and returns `200`.
- `DELETE /api/bookings/:id` deletes a booking and returns `204`.

All booking fields are required after merging a PATCH with the existing record. Equipment must exist. `startAt` must be before `endAt`. Two bookings for one equipment conflict when `existing.startAt < new.endAt` and `existing.endAt > new.startAt`; an end time equal to another start time is allowed.

See [API_CONTRACT.md](API_CONTRACT.md), [SCHEMA.md](SCHEMA.md), and [TEST_EVIDENCE.md](TEST_EVIDENCE.md).

## Optional Cloudflare Workers / D1 deployment

The repository also includes a Cloudflare-compatible Worker in [src/worker.ts](src/worker.ts), a D1 migration in `migrations/0001_initial.sql`, and [wrangler.toml](wrangler.toml). The local Node/SQLite server remains the default lab option.

To deploy to your own Cloudflare account:

```powershell
npx wrangler login
npm.cmd run cf:d1:create
```

Copy the D1 `database_id` printed by Wrangler into `wrangler.toml` in place of `REPLACE_WITH_YOUR_D1_DATABASE_ID`, then run:

```powershell
npm.cmd run cf:d1:migrate
npm.cmd run cf:deploy
```

For a local Worker preview using the D1 migration:

```powershell
npm.cmd run cf:dev
```

Cloudflare will print the deployed HTTPS URL after `cf:deploy`. That URL, rather than `localhost`, is the Cloudflare API Base URL.

Current deployed API URL: `https://campus-equipment-booking-api.julia123.workers.dev/api`