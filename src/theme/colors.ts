export const colors = {
  primary: '#1F7A3A',
  primaryDark: '#155C2B',
  primaryLight: '#2E9C4E',

  background: '#FAFAF7',
  surface: '#FFFFFF',
  border: '#E2E5DF',

  textPrimary: '#141A15',
  textSecondary: '#5A6660',
  textInverse: '#FFFFFF',

  statusExcelente: '#1F7A3A',
  statusMeta: '#E5A100',
  statusAbaixo: '#C8361D',
  statusSemDados: '#8A938D',

  weightScaleBg: '#F2F5EF',
};

export type StatusKey = 'excelente' | 'meta' | 'abaixo' | 'sem-dados';

export const statusColor: Record<StatusKey, string> = {
  excelente: colors.statusExcelente,
  meta: colors.statusMeta,
  abaixo: colors.statusAbaixo,
  'sem-dados': colors.statusSemDados,
};
