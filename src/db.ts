import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type AppDatabase = Database.Database;

export function createDatabase(filename = 'data/campus-booking.db'): AppDatabase {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = new Database(filename);
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS equipment (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      equipment_id TEXT NOT NULL,
      borrower_name TEXT NOT NULL,
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      purpose TEXT NOT NULL,
      FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT
    );
  `);
  const count = db.prepare('SELECT COUNT(*) AS count FROM equipment').get() as { count: number };
  if (count.count === 0) {
    const insert = db.prepare('INSERT INTO equipment (id, name, location) VALUES (?, ?, ?)');
    db.transaction(() => {
      insert.run('eq-1', 'Projector A', 'Building 1');
      insert.run('eq-2', 'Camera Kit B', 'Media Lab');
    })();
  }
  return db;
}