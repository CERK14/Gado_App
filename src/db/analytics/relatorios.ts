import { animaisRepo, lotesRepo, pesagensRepo } from '../repos';
import type { LoteRow, PesagemRow } from '../types';

const MS_POR_DIA = 1000 * 60 * 60 * 24;

export type GanhoTotal = {
  ganhoKg: number;
  ganhoArroba: number;
  valorReais: number | null;
  animaisConsiderados: number;
};

export type MetaVsRealLote = {
  lote: LoteRow;
  ganhoRealKg: number;
  ganhoMetaKg: number;
  diasMedios: number;
  animaisConsiderados: number;
};

export type ProjecaoAbateLote = {
  lote: LoteRow;
  pesoAbateKg: number;
  pesoMedioAtualKg: number;
  totalAnimais: number;
  gmdUsadoKg: number;
  usandoGmdReal: boolean;
  diasRestantes: number | null;
  dataPrevista: Date | null;
  valorEstimadoReais: number | null;
};

function agruparPorAnimal(ps: PesagemRow[]): Map<string, PesagemRow[]> {
  const mapa = new Map<string, PesagemRow[]>();
  for (const p of ps) {
    const lista = mapa.get(p.animal_id) ?? [];
    lista.push(p);
    mapa.set(p.animal_id, lista);
  }
  return mapa;
}

export async function computeGanhoTotal(precoKg: number): Promise<GanhoTotal> {
  const lotes = await lotesRepo.listLotes();
  let ganhoKg = 0;
  let animaisConsiderados = 0;

  for (const l of lotes) {
    const pesagens = await pesagensRepo.listByLote(l.id);
    const mapa = agruparPorAnimal(pesagens);
    for (const ps of mapa.values()) {
      if (ps.length < 2) continue;
      const primeira = ps[0];
      const ultima = ps[ps.length - 1];
      ganhoKg += ultima.peso_kg - primeira.peso_kg;
      animaisConsiderados += 1;
    }
  }

  return {
    ganhoKg,
    ganhoArroba: ganhoKg / 15,
    valorReais: precoKg > 0 ? ganhoKg * precoKg : null,
    animaisConsiderados,
  };
}

export async function computeMetaVsReal(metaGMD: number): Promise<MetaVsRealLote[]> {
  const lotes = await lotesRepo.listLotes();
  const resultados: MetaVsRealLote[] = [];

  for (const l of lotes) {
    const pesagens = await pesagensRepo.listByLote(l.id);
    const mapa = agruparPorAnimal(pesagens);
    let ganhoReal = 0;
    let ganhoMeta = 0;
    let somaDias = 0;
    let considerados = 0;

    for (const ps of mapa.values()) {
      if (ps.length < 2) continue;
      const primeira = ps[0];
      const ultima = ps[ps.length - 1];
      const dias = (new Date(ultima.data).getTime() - new Date(primeira.data).getTime()) / MS_POR_DIA;
      if (dias <= 0) continue;
      ganhoReal += ultima.peso_kg - primeira.peso_kg;
      ganhoMeta += metaGMD * dias;
      somaDias += dias;
      considerados += 1;
    }

    resultados.push({
      lote: l,
      ganhoRealKg: ganhoReal,
      ganhoMetaKg: ganhoMeta,
      diasMedios: considerados > 0 ? somaDias / considerados : 0,
      animaisConsiderados: considerados,
    });
  }

  return resultados;
}

export async function computeProjecoesAbate(
  metaGMD: number,
  precoKg: number
): Promise<ProjecaoAbateLote[]> {
  const lotes = await lotesRepo.listLotes();
  const resultados: ProjecaoAbateLote[] = [];

  for (const l of lotes) {
    if (l.peso_abate == null) continue;

    const animais = await animaisRepo.listByLote(l.id);
    if (animais.length === 0) continue;

    const pesagens = await pesagensRepo.listByLote(l.id);
    const mapa = agruparPorAnimal(pesagens);

    let somaUltimoKg = 0;
    let comUltimoPeso = 0;
    const gmds: number[] = [];

    for (const a of animais) {
      const ps = mapa.get(a.id) ?? [];
      const ultima = ps[ps.length - 1];
      if (ultima) {
        somaUltimoKg += ultima.peso_kg;
        comUltimoPeso += 1;
      }
      if (ps.length >= 2) {
        const primeira = ps[0];
        const ult = ps[ps.length - 1];
        const dias = (new Date(ult.data).getTime() - new Date(primeira.data).getTime()) / MS_POR_DIA;
        if (dias > 0) {
          gmds.push((ult.peso_kg - primeira.peso_kg) / dias);
        }
      }
    }

    if (comUltimoPeso === 0) continue;

    const pesoMedioAtual = somaUltimoKg / comUltimoPeso;
    const temGmdReal = gmds.length > 0;
    const gmdUsado = temGmdReal ? gmds.reduce((a, b) => a + b, 0) / gmds.length : metaGMD;

    let diasRestantes: number | null = null;
    let dataPrevista: Date | null = null;
    if (gmdUsado > 0 && pesoMedioAtual < l.peso_abate) {
      diasRestantes = Math.ceil((l.peso_abate - pesoMedioAtual) / gmdUsado);
      dataPrevista = new Date(Date.now() + diasRestantes * MS_POR_DIA);
    } else if (pesoMedioAtual >= l.peso_abate) {
      diasRestantes = 0;
      dataPrevista = new Date();
    }

    const valorEstimado =
      temGmdReal && precoKg > 0 ? l.peso_abate * animais.length * precoKg : null;

    resultados.push({
      lote: l,
      pesoAbateKg: l.peso_abate,
      pesoMedioAtualKg: pesoMedioAtual,
      totalAnimais: animais.length,
      gmdUsadoKg: gmdUsado,
      usandoGmdReal: temGmdReal,
      diasRestantes,
      dataPrevista,
      valorEstimadoReais: valorEstimado,
    });
  }

  return resultados;
}
