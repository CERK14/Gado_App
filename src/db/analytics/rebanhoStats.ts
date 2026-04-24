import { lotesRepo } from '../repos';
import { listAnimaisComStats, type AnimalStats } from './animalStats';
import { statusGMD } from '../../utils/gmd';
import type { StatusKey } from '../../theme/colors';

export type RebanhoStats = {
  totalAnimais: number;
  animaisComGmd: number;
  gmdMedioGeral: number | null;
  statusGeral: StatusKey;
};

export async function computeRebanhoStats(metaGMD: number): Promise<RebanhoStats> {
  const lotes = await lotesRepo.listLotes();
  const todos: AnimalStats[] = [];
  for (const l of lotes) {
    const s = await listAnimaisComStats(l.id, metaGMD, l.peso_abate);
    todos.push(...s);
  }
  const comGmd = todos.map((t) => t.gmd).filter((g): g is number => g != null);
  const gmdMedioGeral = comGmd.length > 0 ? comGmd.reduce((a, b) => a + b, 0) / comGmd.length : null;
  return {
    totalAnimais: todos.length,
    animaisComGmd: comGmd.length,
    gmdMedioGeral,
    statusGeral: statusGMD(gmdMedioGeral, metaGMD),
  };
}
