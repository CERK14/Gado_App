export const KG_POR_ARROBA = 15;

export type Unidade = 'kg' | '@';

export function kgParaArroba(kg: number): number {
  return kg / KG_POR_ARROBA;
}

export function arrobaParaKg(arroba: number): number {
  return arroba * KG_POR_ARROBA;
}

export function pesoAmbos(valor: number, unidade: Unidade): { peso_kg: number; peso_arroba: number } {
  if (unidade === 'kg') {
    return { peso_kg: valor, peso_arroba: kgParaArroba(valor) };
  }
  return { peso_kg: arrobaParaKg(valor), peso_arroba: valor };
}

export function formatPeso(peso_kg: number, peso_arroba: number, unidade: Unidade): string {
  const valor = unidade === 'kg' ? peso_kg : peso_arroba;
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${unidade}`;
}

export function labelPeso(unidade: Unidade): string {
  return unidade === 'kg' ? 'Peso (kg)' : 'Peso (@)';
}

export function labelGMD(unidade: Unidade): string {
  return unidade === 'kg' ? 'kg/dia' : '@/dia';
}
