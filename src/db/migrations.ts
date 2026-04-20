import type { SQLiteDatabase } from 'expo-sqlite';
import { CURRENT_SCHEMA_VERSION } from './schema';

type Migration = {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
};

export const migrations: Migration[] = [];

export async function runMigrations(db: SQLiteDatabase, from: number): Promise<number> {
  let current = from;
  for (const m of migrations) {
    if (m.version > current && m.version <= CURRENT_SCHEMA_VERSION) {
      await m.up(db);
      current = m.version;
    }
  }
  return current;
}
