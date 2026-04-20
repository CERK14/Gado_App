import * as SQLite from 'expo-sqlite';
import { CURRENT_SCHEMA_VERSION, SCHEMA_STATEMENTS } from './schema';

const DB_NAME = 'gadoapp.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

export async function initDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('PRAGMA foreign_keys = ON;');

  for (const stmt of SCHEMA_STATEMENTS) {
    await db.execAsync(stmt);
  }

  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1;'
  );

  if (!row) {
    await db.runAsync(
      'INSERT INTO schema_version (version) VALUES (?);',
      CURRENT_SCHEMA_VERSION
    );
  } else if (row.version < CURRENT_SCHEMA_VERSION) {
    await db.runAsync(
      'UPDATE schema_version SET version = ?;',
      CURRENT_SCHEMA_VERSION
    );
  }

  console.log(`[sqlite] pronto (schema v${CURRENT_SCHEMA_VERSION})`);
}
