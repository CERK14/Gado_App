import { getDatabase } from '../sqlite';
import type { ConfigRow } from '../types';

function nowIso(): string {
  return new Date().toISOString();
}

export async function getConfig(): Promise<ConfigRow> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ConfigRow>('SELECT * FROM config WHERE id = 1;');
  if (!row) throw new Error('Config não inicializada.');
  return row;
}

export type ConfigPatch = Partial<Pick<ConfigRow, 'meta_gmd' | 'peso_abate' | 'preco_kg' | 'unidade'>>;

export async function updateConfig(patch: ConfigPatch): Promise<ConfigRow> {
  const db = await getDatabase();
  const campos: string[] = [];
  const valores: unknown[] = [];

  if (patch.meta_gmd != null) { campos.push('meta_gmd = ?'); valores.push(patch.meta_gmd); }
  if (patch.peso_abate != null) { campos.push('peso_abate = ?'); valores.push(patch.peso_abate); }
  if (patch.preco_kg != null) { campos.push('preco_kg = ?'); valores.push(patch.preco_kg); }
  if (patch.unidade) { campos.push('unidade = ?'); valores.push(patch.unidade); }

  if (campos.length === 0) return getConfig();

  campos.push('updated_at = ?');
  valores.push(nowIso());

  await db.runAsync(`UPDATE config SET ${campos.join(', ')} WHERE id = 1;`, valores as never);
  return getConfig();
}
