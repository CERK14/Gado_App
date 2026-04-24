import { getDatabase } from '../sqlite';
import { uuid } from '../../utils/uuid';
import { pesoAmbos, type Unidade } from '../../utils/peso';
import type { PesagemRow } from '../types';

function nowIso(): string {
  return new Date().toISOString();
}

export async function listByAnimal(animal_id: string): Promise<PesagemRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<PesagemRow>(
    'SELECT * FROM pesagens WHERE animal_id = ? ORDER BY data ASC;',
    animal_id
  );
}

export async function listByLote(lote_id: string): Promise<PesagemRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<PesagemRow>(
    `SELECT p.* FROM pesagens p
       JOIN animais a ON a.id = p.animal_id AND a.deleted_at IS NULL
      WHERE a.lote_id = ?
      ORDER BY p.animal_id, p.data ASC;`,
    lote_id
  );
}

export async function countByAnimal(animal_id: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM pesagens WHERE animal_id = ?;',
    animal_id
  );
  return row?.c ?? 0;
}

export async function ultimaPesagem(animal_id: string): Promise<PesagemRow | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PesagemRow>(
    'SELECT * FROM pesagens WHERE animal_id = ? ORDER BY data DESC LIMIT 1;',
    animal_id
  );
  return row ?? null;
}

export type NovaPesagem = {
  animal_id: string;
  valor: number;
  unidade: Unidade;
  data?: string;
};

export async function createPesagem(entrada: NovaPesagem): Promise<PesagemRow> {
  const db = await getDatabase();
  const id = uuid();
  const now = nowIso();
  const { peso_kg, peso_arroba } = pesoAmbos(entrada.valor, entrada.unidade);
  const data = entrada.data ?? now;

  await db.runAsync(
    `INSERT INTO pesagens (id, animal_id, peso_kg, peso_arroba, data, created_at)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [id, entrada.animal_id, peso_kg, peso_arroba, data, now]
  );

  const criada = await db.getFirstAsync<PesagemRow>(
    'SELECT * FROM pesagens WHERE id = ?;',
    id
  );
  if (!criada) throw new Error('Falha ao registrar pesagem.');
  return criada;
}
