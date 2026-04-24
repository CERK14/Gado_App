import { animaisRepo, pesagensRepo } from '../repos';
import type { AnimalRow, PesagemRow } from '../types';
import { calcGMD, statusGMD } from '../../utils/gmd';
import type { StatusKey } from '../../theme/colors';

export type AnimalStats = {
  animal: AnimalRow;
  ultimoPesoKg: number | null;
  ultimoPesoArroba: number | null;
  ultimaPesagemData: string | null;
  totalPesagens: number;
  gmd: number | null;
  status: StatusKey;
  prontoParaAbate: boolean;
};

function agruparPorAnimal(pesagens: PesagemRow[]): Map<string, PesagemRow[]> {
  const mapa = new Map<string, PesagemRow[]>();
  for (const p of pesagens) {
    const lista = mapa.get(p.animal_id) ?? [];
    lista.push(p);
    mapa.set(p.animal_id, lista);
  }
  return mapa;
}

export async function listAnimaisComStats(
  loteId: string,
  metaGMD: number,
  pesoAbateLote: number | null
): Promise<AnimalStats[]> {
  const [animais, pesagens] = await Promise.all([
    animaisRepo.listByLote(loteId),
    pesagensRepo.listByLote(loteId),
  ]);
  const mapa = agruparPorAnimal(pesagens);

  return animais.map((animal) => {
    const ps = mapa.get(animal.id) ?? [];
    const ultima = ps[ps.length - 1] ?? null;
    const gmd = calcGMD(ps.map((p) => ({ peso_kg: p.peso_kg, data: p.data })));
    const status = statusGMD(gmd, metaGMD);
    const prontoParaAbate =
      pesoAbateLote != null && ultima != null && ultima.peso_kg >= pesoAbateLote;

    return {
      animal,
      ultimoPesoKg: ultima?.peso_kg ?? null,
      ultimoPesoArroba: ultima?.peso_arroba ?? null,
      ultimaPesagemData: ultima?.data ?? null,
      totalPesagens: ps.length,
      gmd,
      status,
      prontoParaAbate,
    };
  });
}

export type OrdemAnimais = 'peso-asc' | 'peso-desc' | 'gmd-asc' | 'gmd-desc';

export function ordenarAnimais(stats: AnimalStats[], ordem: OrdemAnimais): AnimalStats[] {
  const copia = [...stats];
  const cmpPeso = (a: AnimalStats, b: AnimalStats) =>
    (a.ultimoPesoKg ?? -Infinity) - (b.ultimoPesoKg ?? -Infinity);
  const cmpGmd = (a: AnimalStats, b: AnimalStats) =>
    (a.gmd ?? -Infinity) - (b.gmd ?? -Infinity);

  switch (ordem) {
    case 'peso-asc':
      copia.sort(cmpPeso);
      break;
    case 'peso-desc':
      copia.sort((a, b) => -cmpPeso(a, b));
      break;
    case 'gmd-asc':
      copia.sort(cmpGmd);
      break;
    case 'gmd-desc':
      copia.sort((a, b) => -cmpGmd(a, b));
      break;
  }
  return copia;
}
