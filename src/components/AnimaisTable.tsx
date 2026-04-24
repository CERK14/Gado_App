import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AnimalStats, OrdemAnimais } from '../db/analytics/animalStats';
import { colors, radius, spacing, statusColor, typography } from '../theme';
import { statusEmoji } from '../utils/gmd';
import { formatPeso, labelGMD, type Unidade } from '../utils/peso';

type Props = {
  animais: AnimalStats[];
  unidade: Unidade;
  ordem: OrdemAnimais;
  onChangeOrdem: (o: OrdemAnimais) => void;
  onPesar: (a: AnimalStats) => void;
  onHistorico: (a: AnimalStats) => void;
};

const BOTOES_ORDEM: { key: OrdemAnimais; label: string }[] = [
  { key: 'peso-desc', label: 'Peso ▼' },
  { key: 'peso-asc', label: 'Peso ▲' },
  { key: 'gmd-desc', label: 'GMD ▼' },
  { key: 'gmd-asc', label: 'GMD ▲' },
];

function formatGmd(gmd: number | null, unidade: Unidade): string {
  if (gmd == null) return '—';
  const v = unidade === 'kg' ? gmd : gmd / 15;
  return `${v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${labelGMD(unidade)}`;
}

export function AnimaisTable({ animais, unidade, ordem, onChangeOrdem, onPesar, onHistorico }: Props) {
  return (
    <View>
      <View style={styles.ordemRow}>
        {BOTOES_ORDEM.map((b) => {
          const ativo = ordem === b.key;
          return (
            <Pressable
              key={b.key}
              onPress={() => onChangeOrdem(b.key)}
              style={[styles.ordemBtn, ativo && styles.ordemBtnAtivo]}
            >
              <Text style={[styles.ordemLabel, ativo && styles.ordemLabelAtivo]}>
                {b.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.headerRow}>
        <Text style={[styles.col, styles.colCodigo, styles.headerTxt]}>Código</Text>
        <Text style={[styles.col, styles.colPeso, styles.headerTxt]}>Último</Text>
        <Text style={[styles.col, styles.colGmd, styles.headerTxt]}>GMD</Text>
        <Text style={[styles.col, styles.colStatus, styles.headerTxt]}></Text>
        <Text style={[styles.col, styles.colAcoes, styles.headerTxt]}></Text>
      </View>

      {animais.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTxt}>Nenhum animal cadastrado ainda.</Text>
          <Text style={styles.emptyHint}>Use a aba Pesar para registrar o primeiro.</Text>
        </View>
      ) : (
        animais.map((a) => (
          <View key={a.animal.id} style={styles.linha}>
            <Text style={[styles.col, styles.colCodigo]} numberOfLines={1}>
              {a.animal.codigo}
            </Text>
            <Text style={[styles.col, styles.colPeso]} numberOfLines={1}>
              {a.ultimoPesoKg != null
                ? formatPeso(a.ultimoPesoKg, a.ultimoPesoArroba ?? 0, unidade)
                : '—'}
            </Text>
            <Text style={[styles.col, styles.colGmd]} numberOfLines={1}>
              {formatGmd(a.gmd, unidade)}
            </Text>
            <View style={[styles.col, styles.colStatus]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor[a.status] }]}>
                <Text style={styles.statusEmoji}>{statusEmoji(a.status)}</Text>
              </View>
            </View>
            <View style={[styles.col, styles.colAcoes]}>
              <Pressable onPress={() => onPesar(a)} hitSlop={8} style={styles.acaoBtn}>
                <Text style={styles.acaoIcon}>⚖️</Text>
              </Pressable>
              <Pressable onPress={() => onHistorico(a)} hitSlop={8} style={styles.acaoBtn}>
                <Text style={styles.acaoIcon}>📋</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ordemRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  ordemBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ordemBtnAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ordemLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  ordemLabelAtivo: {
    color: colors.textInverse,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTxt: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  linha: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  col: {
    ...typography.body,
    color: colors.textPrimary,
  },
  colCodigo: { flex: 1.3 },
  colPeso: { flex: 1.4 },
  colGmd: { flex: 1.4 },
  colStatus: { width: 28, alignItems: 'center' },
  colAcoes: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: 72,
    justifyContent: 'flex-end',
  },
  statusDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusEmoji: { fontSize: 10 },
  acaoBtn: {
    padding: 4,
  },
  acaoIcon: { fontSize: 18 },
  emptyBox: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyTxt: { ...typography.body, color: colors.textSecondary },
  emptyHint: { ...typography.caption, color: colors.textSecondary },
});
