# API Contract

Base URL: `http://localhost:8787/api`

## Equipment

`GET /equipment` returns `200`:

```json
[
  { "id": "eq-1", "name": "Projector A", "location": "Building 1" },
  { "id": "eq-2", "name": "Camera Kit B", "location": "Media Lab" }
]
```

## Bookings

Create and update payload:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

| Method | Path | Success | Meaning |
| --- | --- | --- | --- |
| GET | `/bookings` | 200 | List bookings |
| GET | `/bookings/:id` | 200 | Get one booking |
| POST | `/bookings` | 201 | Create booking |
| PATCH | `/bookings/:id` | 200 | Update booking |
| DELETE | `/bookings/:id` | 204 | Delete booking |

Errors always use `{ "error": "message" }`. `400` means malformed or invalid data, including an unknown equipment ID. `404` means the booking ID does not exist. `409` means the requested time overlaps an existing booking for the same equipment.