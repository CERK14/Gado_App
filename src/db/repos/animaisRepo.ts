import { getDatabase } from '../sqlite';
import { uuid } from '../../utils/uuid';
import type { AnimalComUltimoPeso, AnimalRow } from '../types';

function nowIso(): string {
  return new Date().toISOString();
}

export async function countAnimaisAtivos(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM animais WHERE deleted_at IS NULL;'
  );
  return row?.c ?? 0;
}

export async function countByLote(lote_id: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM animais WHERE lote_id = ? AND deleted_at IS NULL;',
    lote_id
  );
  return row?.c ?? 0;
}

export async function listByLote(lote_id: string): Promise<AnimalRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<AnimalRow>(
    'SELECT * FROM animais WHERE lote_id = ? AND deleted_at IS NULL ORDER BY codigo ASC;',
    lote_id
  );
}

export async function listByLoteComUltimoPeso(lote_id: string): Promise<AnimalComUltimoPeso[]> {
  const db = await getDatabase();
  return db.getAllAsync<AnimalComUltimoPeso>(
    `SELECT a.*,
            p.peso_kg AS ultimo_peso_kg,
            p.peso_arroba AS ultimo_peso_arroba,
            p.data AS ultima_pesagem,
            COALESCE(pc.total, 0) AS total_pesagens
       FROM animais a
       LEFT JOIN (
         SELECT p1.animal_id, p1.peso_kg, p1.peso_arroba, p1.data
           FROM pesagens p1
           JOIN (
             SELECT animal_id, MAX(data) AS max_data FROM pesagens GROUP BY animal_id
           ) p2 ON p2.animal_id = p1.animal_id AND p2.max_data = p1.data
       ) p ON p.animal_id = a.id
       LEFT JOIN (
         SELECT animal_id, COUNT(*) AS total FROM pesagens GROUP BY animal_id
       ) pc ON pc.animal_id = a.id
      WHERE a.lote_id = ? AND a.deleted_at IS NULL
      ORDER BY a.codigo ASC;`,
    lote_id
  );
}

export async function getAnimal(id: string): Promise<AnimalRow | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<AnimalRow>(
    'SELECT * FROM animais WHERE id = ? AND deleted_at IS NULL;',
    id
  );
  return row ?? null;
}

export async function findByCodigoNoLote(lote_id: string, codigo: string): Promise<AnimalRow | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<AnimalRow>(
    'SELECT * FROM animais WHERE lote_id = ? AND codigo = ? AND deleted_at IS NULL LIMIT 1;',
    [lote_id, codigo]
  );
  return row ?? null;
}

export async function buscarPorCodigoParcial(lote_id: string, prefixo: string, limite = 8): Promise<AnimalRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<AnimalRow>(
    `SELECT * FROM animais
      WHERE lote_id = ? AND deleted_at IS NULL AND codigo LIKE ?
      ORDER BY codigo ASC LIMIT ?;`,
    [lote_id, `${prefixo}%`, limite]
  );
}

export async function createAnimal(lote_id: string, codigo: string): Promise<AnimalRow> {
  const db = await getDatabase();
  const id = uuid();
  const now = nowIso();
  await db.runAsync(
    `INSERT INTO animais (id, lote_id, codigo, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?);`,
    [id, lote_id, codigo, now, now]
  );
  const criado = await getAnimal(id);
  if (!criado) throw new Error('Falha ao criar animal.');
  return criado;
}

export async function moveAnimal(id: string, novoLoteId: string): Promise<void> {
  const db = await getDatabase();
  const now = nowIso();
  await db.runAsync(
    'UPDATE animais SET lote_id = ?, updated_at = ? WHERE id = ?;',
    [novoLoteId, now, id]
  );
}

export async function moverAnimaisDeLote(origemLoteId: string, destinoLoteId: string): Promise<void> {
  const db = await getDatabase();
  const now = nowIso();
  await db.runAsync(
    'UPDATE animais SET lote_id = ?, updated_at = ? WHERE lote_id = ? AND deleted_at IS NULL;',
    [destinoLoteId, now, origemLoteId]
  );
}

export async function softDeleteAnimal(id: string): Promise<void> {
  const db = await getDatabase();
  const now = nowIso();
  await db.runAsync(
    'UPDATE animais SET deleted_at = ?, updated_at = ? WHERE id = ?;',
    [now, now, id]
  );
}

export async function softDeleteAnimaisDoLote(lote_id: string): Promise<void> {
  const db = await getDatabase();
  const now = nowIso();
  await db.runAsync(
    'UPDATE animais SET deleted_at = ?, updated_at = ? WHERE lote_id = ? AND deleted_at IS NULL;',
    [now, now, lote_id]
  );
}
