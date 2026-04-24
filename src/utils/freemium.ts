import type { Plano } from '../store/appStore';

export const LIMITES_FREE = {
  lotes: 1,
  animais: 20,
  pesagensPorAnimal: 3,
};

export type MotivoBloqueio =
  | 'criar-lote'
  | 'criar-animal'
  | 'registrar-pesagem'
  | 'projecao-abate'
  | 'exportar';

export type ResultadoLimite =
  | { permitido: true }
  | { permitido: false; mensagem: string };

function mensagemUpgrade(motivo: MotivoBloqueio): string {
  switch (motivo) {
    case 'criar-lote':
      return 'Você está usando o GadoApp gratuito. Para adicionar mais um lote, faça upgrade para o Plano Pro.';
    case 'criar-animal':
      return 'Você atingiu o limite de 20 animais do plano gratuito. Faça upgrade para animais ilimitados.';
    case 'registrar-pesagem':
      return 'No plano gratuito são salvas 3 pesagens por animal. Faça upgrade para o histórico completo.';
    case 'projecao-abate':
      return 'A projeção de abate está no Plano Pro.';
    case 'exportar':
      return 'A exportação de dados está no Plano Pro.';
  }
}

export function isPro(plano: Plano): boolean {
  return plano === 'pro';
}

export function podeCriarLote(plano: Plano, totalLotes: number): ResultadoLimite {
  if (isPro(plano) || totalLotes < LIMITES_FREE.lotes) return { permitido: true };
  return { permitido: false, mensagem: mensagemUpgrade('criar-lote') };
}

export function podeCriarAnimal(plano: Plano, totalAnimais: number): ResultadoLimite {
  if (isPro(plano) || totalAnimais < LIMITES_FREE.animais) return { permitido: true };
  return { permitido: false, mensagem: mensagemUpgrade('criar-animal') };
}

export function podeRegistrarPesagem(plano: Plano, pesagensDoAnimal: number): ResultadoLimite {
  if (isPro(plano) || pesagensDoAnimal < LIMITES_FREE.pesagensPorAnimal) return { permitido: true };
  return { permitido: false, mensagem: mensagemUpgrade('registrar-pesagem') };
}

export function podeVerProjecaoAbate(plano: Plano): ResultadoLimite {
  if (isPro(plano)) return { permitido: true };
  return { permitido: false, mensagem: mensagemUpgrade('projecao-abate') };
}

export function podeExportar(plano: Plano): ResultadoLimite {
  if (isPro(plano)) return { permitido: true };
  return { permitido: false, mensagem: mensagemUpgrade('exportar') };
}
