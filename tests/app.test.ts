import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createDatabase } from '../src/db.js';

function makeApp() { return createApp(createDatabase(':memory:')); }
const payload = {
  equipmentId: 'eq-1', borrowerName: 'Somchai Jaidee',
  startAt: '2026-10-20T09:00:00.000Z', endAt: '2026-10-20T11:00:00.000Z',
  purpose: 'Class presentation',
};
const json = { 'Content-Type': 'application/json' };

describe('booking API', () => {
  it('lists seeded equipment', async () => {
    const response = await makeApp().request('/api/equipment');
    expect(response.status).toBe(200);
    expect(await response.json()).toHaveLength(2);
  });

  it('allows the configured browser frontend origins', async () => {
    const response = await makeApp().request('/api/equipment', {
      headers: { Origin: 'http://localhost:5173' },
    });
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
  });
  it('creates a booking and prevents overlap', async () => {
    const app = makeApp();
    expect((await app.request('/api/bookings', { method: 'POST', body: JSON.stringify(payload), headers: json })).status).toBe(201);
    const conflict = await app.request('/api/bookings', { method: 'POST', body: JSON.stringify(payload), headers: json });
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toEqual({ error: 'Booking time conflicts with an existing booking' });
  });
  it('rejects invalid times and unknown equipment', async () => {
    const app = makeApp();
    expect((await app.request('/api/bookings', { method: 'POST', body: JSON.stringify({ ...payload, startAt: payload.endAt }), headers: json })).status).toBe(400);
    expect((await app.request('/api/bookings', { method: 'POST', body: JSON.stringify({ ...payload, equipmentId: 'missing' }), headers: json })).status).toBe(400);
  });
  it('returns 404 for an unknown booking', async () => {
    expect((await makeApp().request('/api/bookings/missing')).status).toBe(404);
  });
  it('updates and deletes a booking', async () => {
    const app = makeApp();
    const created = await app.request('/api/bookings', { method: 'POST', body: JSON.stringify(payload), headers: json });
    const booking = await created.json() as { id: string };
    expect((await app.request(`/api/bookings/${booking.id}`, { method: 'PATCH', body: JSON.stringify({ purpose: 'Updated purpose' }), headers: json })).status).toBe(200);
    expect((await app.request(`/api/bookings/${booking.id}`, { method: 'DELETE' })).status).toBe(204);
  });

  it('prevents an update from overlapping another booking', async () => {
    const app = makeApp();
    await app.request('/api/bookings', { method: 'POST', body: JSON.stringify(payload), headers: json });
    const second = await app.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ ...payload, startAt: '2026-10-20T12:00:00.000Z', endAt: '2026-10-20T13:00:00.000Z' }),
      headers: json,
    });
    const secondBooking = await second.json() as { id: string };
    const update = await app.request(`/api/bookings/${secondBooking.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ startAt: '2026-10-20T10:00:00.000Z', endAt: '2026-10-20T10:30:00.000Z' }),
      headers: json,
    });
    expect(update.status).toBe(409);
  });
});