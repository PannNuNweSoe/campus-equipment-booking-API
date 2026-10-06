import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { createDatabase } from './db.js';

const port = Number(process.env.PORT ?? 8787);
const app = createApp(createDatabase());
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Campus Equipment Booking API listening on http://localhost:${info.port}`);
});