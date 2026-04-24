import { getDatabase } from '../sqlite';
import { uuid } from '../../utils/uuid';
import type { LoteRow } from '../types';

const CORES_LOTE = ['#2E9C4E', '#E5A100', '#3C7BD1', '#7B3CD1', '#D13C7B', '#1F7A3A', '#C8361D'];

function nowIso(): string {
  return new Date().toISOString();
}

function corSequencial(count: number): string {
  return CORES_LOTE[count % CORES_LOTE.length];
}

export async function listLotes(): Promise<LoteRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<LoteRow>(
    'SELECT * FROM lotes WHERE deleted_at IS NULL ORDER BY created_at ASC;'
  );
}

export async function getLote(id: string): Promise<LoteRow | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<LoteRow>(
    'SELECT * FROM lotes WHERE id = ? AND deleted_at IS NULL;',
    id
  );
  return row ?? null;
}

export async function countLotesAtivos(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM lotes WHERE deleted_at IS NULL;'
  );
  return row?.c ?? 0;
}

export type NovoLote = {
  nome: string;
  peso_abate?: number | null;
  cor?: string;
};

export async function createLote(entrada: NovoLote): Promise<LoteRow> {
  const db = await getDatabase();
  const id = uuid();
  const now = nowIso();
  const total = await countLotesAtivos();
  const cor = entrada.cor ?? corSequencial(total);

  await db.runAsync(
    `INSERT INTO lotes (id, nome, cor, peso_abate, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [id, entrada.nome, cor, entrada.peso_abate ?? null, now, now]
  );

  const created = await getLote(id);
  if (!created) throw new Error('Falha ao criar lote.');
  return created;
}

export type PatchLote = Partial<Pick<LoteRow, 'nome' | 'cor' | 'peso_abate'>>;

export async function updateLote(id: string, patch: PatchLote): Promise<LoteRow> {
  const db = await getDatabase();
  const campos: string[] = [];
  const valores: unknown[] = [];

  if (patch.nome != null) { campos.push('nome = ?'); valores.push(patch.nome); }
  if (patch.cor != null) { campos.push('cor = ?'); valores.push(patch.cor); }
  if (patch.peso_abate !== undefined) { campos.push('peso_abate = ?'); valores.push(patch.peso_abate); }

  if (campos.length === 0) {
    const lote = await getLote(id);
    if (!lote) throw new Error('Lote não encontrado.');
    return lote;
  }

  campos.push('updated_at = ?');
  valores.push(nowIso());
  valores.push(id);

  await db.runAsync(`UPDATE lotes SET ${campos.join(', ')} WHERE id = ?;`, valores as never);
  const atualizado = await getLote(id);
  if (!atualizado) throw new Error('Lote não encontrado após update.');
  return atualizado;
}

export async function softDeleteLote(id: string): Promise<void> {
  const db = await getDatabase();
  const now = nowIso();
  await db.runAsync(
    'UPDATE lotes SET deleted_at = ?, updated_at = ? WHERE id = ?;',
    [now, now, id]
  );
}
