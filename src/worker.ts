import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface Env {
  DB: D1Database;
}

type BookingInput = {
  equipmentId: string;
  borrowerName: string;
  startAt: string;
  endAt: string;
  purpose: string;
};

type BookingRow = BookingInput & { id: string };

const error = (message: string, status: 400 | 404 | 409) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function toBooking(row: Record<string, unknown>): BookingRow {
  return {
    id: String(row.id),
    equipmentId: String(row.equipment_id),
    borrowerName: String(row.borrower_name),
    startAt: String(row.start_at),
    endAt: String(row.end_at),
    purpose: String(row.purpose),
  };
}

function validateBooking(input: unknown): { value?: BookingInput; message?: string } {
  if (!input || typeof input !== 'object') return { message: 'Request body must be a JSON object' };
  const body = input as Record<string, unknown>;
  const fields = ['equipmentId', 'borrowerName', 'startAt', 'endAt', 'purpose'];
  if (fields.some((field) => typeof body[field] !== 'string' || !(body[field] as string).trim())) {
    return { message: 'equipmentId, borrowerName, startAt, endAt, and purpose are required strings' };
  }
  const start = new Date(body.startAt as string);
  const end = new Date(body.endAt as string);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { message: 'startAt and endAt must be valid ISO date-time values' };
  }
  if (start >= end) return { message: 'startAt must be before endAt' };
  return {
    value: {
      equipmentId: (body.equipmentId as string).trim(),
      borrowerName: (body.borrowerName as string).trim(),
      startAt: (body.startAt as string).trim(),
      endAt: (body.endAt as string).trim(),
      purpose: (body.purpose as string).trim(),
    },
  };
}

async function readJson(request: Request): Promise<unknown> {
  try { return await request.json(); } catch { return undefined; }
}

const app = new Hono<{ Bindings: Env }>();
app.use('/api/*', cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }));

app.get('/api', (c) => c.json({
  name: 'Campus Equipment Booking API',
  status: 'ok',
  runtime: 'cloudflare-workers',
  endpoints: ['/api/equipment', '/api/bookings'],
}));

app.get('/api/equipment', async (c) => {
  const result = await c.env.DB.prepare('SELECT id, name, location FROM equipment ORDER BY id').all();
  return c.json(result.results);
});

app.get('/api/bookings', async (c) => {
  const result = await c.env.DB.prepare('SELECT * FROM bookings ORDER BY start_at').all();
  return c.json((result.results as Record<string, unknown>[]).map(toBooking));
});

app.get('/api/bookings/:id', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(c.req.param('id')).first<Record<string, unknown>>();
  return row ? c.json(toBooking(row)) : error('Booking not found', 404);
});

app.post('/api/bookings', async (c) => {
  const validation = validateBooking(await readJson(c.req.raw));
  if (!validation.value) return error(validation.message ?? 'Invalid booking data', 400);
  const booking = validation.value;
  const equipment = await c.env.DB.prepare('SELECT id FROM equipment WHERE id = ?').bind(booking.equipmentId).first();
  if (!equipment) return error('Equipment not found', 400);
  const conflict = await c.env.DB.prepare(
    'SELECT id FROM bookings WHERE equipment_id = ? AND start_at < ? AND end_at > ? LIMIT 1',
  ).bind(booking.equipmentId, booking.endAt, booking.startAt).first();
  if (conflict) return error('Booking time conflicts with an existing booking', 409);
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO bookings (id, equipment_id, borrower_name, start_at, end_at, purpose) VALUES (?, ?, ?, ?, ?, ?)',
  ).bind(id, booking.equipmentId, booking.borrowerName, booking.startAt, booking.endAt, booking.purpose).run();
  return c.json({ id, ...booking }, 201);
});

app.patch('/api/bookings/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first<Record<string, unknown>>();
  if (!existing) return error('Booking not found', 404);
  const body = await readJson(c.req.raw);
  if (!body || typeof body !== 'object') return error('Request body must be a JSON object', 400);
  const raw = body as Record<string, unknown>;
  const validation = validateBooking({
    equipmentId: raw.equipmentId ?? existing.equipment_id,
    borrowerName: raw.borrowerName ?? existing.borrower_name,
    startAt: raw.startAt ?? existing.start_at,
    endAt: raw.endAt ?? existing.end_at,
    purpose: raw.purpose ?? existing.purpose,
  });
  if (!validation.value) return error(validation.message ?? 'Invalid booking data', 400);
  const booking = validation.value;
  const equipment = await c.env.DB.prepare('SELECT id FROM equipment WHERE id = ?').bind(booking.equipmentId).first();
  if (!equipment) return error('Equipment not found', 400);
  const conflict = await c.env.DB.prepare(
    'SELECT id FROM bookings WHERE equipment_id = ? AND start_at < ? AND end_at > ? AND id <> ? LIMIT 1',
  ).bind(booking.equipmentId, booking.endAt, booking.startAt, id).first();
  if (conflict) return error('Booking time conflicts with an existing booking', 409);
  await c.env.DB.prepare(
    'UPDATE bookings SET equipment_id = ?, borrower_name = ?, start_at = ?, end_at = ?, purpose = ? WHERE id = ?',
  ).bind(booking.equipmentId, booking.borrowerName, booking.startAt, booking.endAt, booking.purpose, id).run();
  return c.json({ id, ...booking });
});

app.delete('/api/bookings/:id', async (c) => {
  const result = await c.env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(c.req.param('id')).run();
  return result.meta.changes ? new Response(null, { status: 204 }) : error('Booking not found', 404);
});

export default app;
