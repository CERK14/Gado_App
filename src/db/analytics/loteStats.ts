import { animaisRepo, lotesRepo, pesagensRepo } from '../repos';
import type { LoteRow, PesagemRow } from '../types';
import { calcGMD, statusGMD } from '../../utils/gmd';
import type { StatusKey } from '../../theme/colors';

export type LoteStats = {
  lote: LoteRow;
  totalAnimais: number;
  pesoMedioKg: number;
  pesoMedioArroba: number;
  pesoTotalKg: number;
  pesoTotalArroba: number;
  gmdMedio: number | null;
  status: StatusKey;
  prontosParaAbate: number;
  badges: Record<StatusKey, number>;
};

export type LoteComStats = LoteStats;

function agruparPorAnimal(pesagens: PesagemRow[]): Map<string, PesagemRow[]> {
  const mapa = new Map<string, PesagemRow[]>();
  for (const p of pesagens) {
    const lista = mapa.get(p.animal_id) ?? [];
    lista.push(p);
    mapa.set(p.animal_id, lista);
  }
  return mapa;
}

export async function computeLoteStats(loteId: string, metaGMD: number): Promise<LoteStats> {
  const lote = await lotesRepo.getLote(loteId);
  if (!lote) throw new Error('Lote não encontrado.');

  const animais = await animaisRepo.listByLote(loteId);
  const pesagens = await pesagensRepo.listByLote(loteId);
  const porAnimal = agruparPorAnimal(pesagens);

  let somaUltimoKg = 0;
  let somaUltimoArroba = 0;
  let comUltimoPeso = 0;
  const gmds: number[] = [];
  const badges: Record<StatusKey, number> = {
    excelente: 0,
    meta: 0,
    abaixo: 0,
    'sem-dados': 0,
  };
  let prontos = 0;
  const pesoAbate = lote.peso_abate;

  for (const animal of animais) {
    const ps = porAnimal.get(animal.id) ?? [];
    const ultima = ps[ps.length - 1];
    if (ultima) {
      somaUltimoKg += ultima.peso_kg;
      somaUltimoArroba += ultima.peso_arroba;
      comUltimoPeso += 1;
      if (pesoAbate != null && ultima.peso_kg >= pesoAbate) prontos += 1;
    }
    const gmd = calcGMD(ps.map((p) => ({ peso_kg: p.peso_kg, data: p.data })));
    const status = statusGMD(gmd, metaGMD);
    badges[status] += 1;
    if (gmd != null) gmds.push(gmd);
  }

  const pesoMedioKg = comUltimoPeso > 0 ? somaUltimoKg / comUltimoPeso : 0;
  const pesoMedioArroba = comUltimoPeso > 0 ? somaUltimoArroba / comUltimoPeso : 0;
  const gmdMedio = gmds.length > 0 ? gmds.reduce((a, b) => a + b, 0) / gmds.length : null;

  return {
    lote,
    totalAnimais: animais.length,
    pesoMedioKg,
    pesoMedioArroba,
    pesoTotalKg: somaUltimoKg,
    pesoTotalArroba: somaUltimoArroba,
    gmdMedio,
    status: statusGMD(gmdMedio, metaGMD),
    prontosParaAbate: prontos,
    badges,
  };
}

export async function listLotesComStats(metaGMD: number): Promise<LoteComStats[]> {
  const lotes = await lotesRepo.listLotes();
  return Promise.all(lotes.map((l) => computeLoteStats(l.id, metaGMD)));
}
