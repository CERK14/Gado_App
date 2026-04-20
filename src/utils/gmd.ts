import type { StatusKey } from '../theme/colors';

export type Pesagem = {
  peso_kg: number;
  data: string | Date;
};

const MS_POR_DIA = 1000 * 60 * 60 * 24;

function toDate(d: string | Date): Date {
  return d instanceof Date ? d : new Date(d);
}

export function calcGMD(pesagens: Pesagem[]): number | null {
  if (pesagens.length < 2) return null;

  const ordenadas = [...pesagens].sort(
    (a, b) => toDate(a.data).getTime() - toDate(b.data).getTime()
  );
  const primeira = ordenadas[0];
  const ultima = ordenadas[ordenadas.length - 1];

  const dias = (toDate(ultima.data).getTime() - toDate(primeira.data).getTime()) / MS_POR_DIA;
  if (dias <= 0) return null;

  return (ultima.peso_kg - primeira.peso_kg) / dias;
}

export function statusGMD(gmd: number | null, meta: number): StatusKey {
  if (gmd == null) return 'sem-dados';
  if (meta <= 0) return 'sem-dados';

  const razao = gmd / meta;
  if (razao >= 1.05) return 'excelente';
  if (razao >= 0.85) return 'meta';
  return 'abaixo';
}

export function statusEmoji(status: StatusKey): string {
  switch (status) {
    case 'excelente':
      return '🟢';
    case 'meta':
      return '🟡';
    case 'abaixo':
      return '🔴';
    case 'sem-dados':
      return '⚪';
  }
}

export function statusLabel(status: StatusKey): string {
  switch (status) {
    case 'excelente':
      return 'Excelente';
    case 'meta':
      return 'Na Meta';
    case 'abaixo':
      return 'Abaixo da Meta';
    case 'sem-dados':
      return 'Sem dados';
  }
}
