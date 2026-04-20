export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY
  );`,

  `CREATE TABLE IF NOT EXISTS config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    meta_gmd REAL NOT NULL DEFAULT 1.2,
    peso_abate REAL NOT NULL DEFAULT 540,
    preco_kg REAL NOT NULL DEFAULT 12,
    unidade TEXT NOT NULL DEFAULT 'kg' CHECK (unidade IN ('kg','@')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );`,

  `INSERT OR IGNORE INTO config (id) VALUES (1);`,

  `CREATE TABLE IF NOT EXISTS lotes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    cor TEXT NOT NULL,
    peso_abate REAL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    deleted_at TEXT,
    synced_at TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS animais (
    id TEXT PRIMARY KEY,
    lote_id TEXT NOT NULL,
    codigo TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    deleted_at TEXT,
    synced_at TEXT,
    FOREIGN KEY (lote_id) REFERENCES lotes(id) ON DELETE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS pesagens (
    id TEXT PRIMARY KEY,
    animal_id TEXT NOT NULL,
    peso_kg REAL NOT NULL,
    peso_arroba REAL NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    synced_at TEXT,
    FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE
  );`,

  `CREATE INDEX IF NOT EXISTS idx_animais_lote ON animais(lote_id);`,
  `CREATE INDEX IF NOT EXISTS idx_pesagens_animal ON pesagens(animal_id);`,
  `CREATE INDEX IF NOT EXISTS idx_pesagens_data ON pesagens(data);`,
  `CREATE INDEX IF NOT EXISTS idx_lotes_synced ON lotes(synced_at);`,
  `CREATE INDEX IF NOT EXISTS idx_animais_synced ON animais(synced_at);`,
  `CREATE INDEX IF NOT EXISTS idx_pesagens_synced ON pesagens(synced_at);`,
];

export const CURRENT_SCHEMA_VERSION = 1;
