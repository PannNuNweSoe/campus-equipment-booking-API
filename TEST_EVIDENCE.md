# Test Evidence

Base URL used: `http://localhost:8787/api`

The recorded HTTP evidence uses the local Node/SQLite runtime. If deployed to Cloudflare, replace this Base URL with the HTTPS URL printed by `npm.cmd run cf:deploy` and repeat the same cases against D1.

Cloudflare deployment verification completed at `https://campus-equipment-booking-api.julia123.workers.dev/api`: the base route returned `200` with `runtime: cloudflare-workers`, the D1-backed equipment route returned `200` with both seeded records, and invalid input returned `400` with the required JSON error format.

Automated verification: `npm.cmd run build` passed and `npm.cmd test` passed with 7 tests.

The following ten cases include all nine cases from the instructor's cURL Quick Test Guide plus unknown-equipment validation. On this Windows machine, the script uses PowerShell's HTTP client because the installed `curl.exe` did not preserve JSON request bodies. The complete commands are in [scripts/curl-tests.ps1](scripts/curl-tests.ps1).

| Case | Request | Expected result |
| --- | --- | --- |
| 1 | `GET /equipment` | `200`, two seeded records |
| 2 | `GET /bookings` | `200`, booking array |
| 3 | `POST /bookings` with valid payload | `201`, booking JSON with `id` |
| 4 | `GET /bookings/:id` | `200`, one booking |
| 5 | `PATCH /bookings/:id` | `200`, updated booking JSON |
| 6 | `POST /bookings` with invalid time | `400`, validation error JSON |
| 7 | overlapping `POST /bookings` | `409`, conflict error JSON |
| 8 | `GET /bookings/not-found` | `404`, not-found error JSON |
| 9 | `DELETE /bookings/:id` | `204`, empty response |
| 10 | `POST /bookings` with unknown equipment | `400`, equipment error JSON |