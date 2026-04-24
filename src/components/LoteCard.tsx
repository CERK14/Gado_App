import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, statusColor, typography } from '../theme';
import { statusEmoji } from '../utils/gmd';
import { formatPeso, labelGMD, type Unidade } from '../utils/peso';
import type { LoteComStats } from '../db/analytics/loteStats';

type Props = {
  stats: LoteComStats;
  unidade: Unidade;
  onPress: () => void;
  onDelete: () => void;
};

export function LoteCard({ stats, unidade, onPress, onDelete }: Props) {
  const { lote, totalAnimais, pesoMedioKg, pesoMedioArroba, pesoTotalKg, pesoTotalArroba, gmdMedio, status, badges } = stats;

  const pesoMedio = totalAnimais > 0 ? formatPeso(pesoMedioKg, pesoMedioArroba, unidade) : '—';
  const pesoTotal = totalAnimais > 0 ? formatPeso(pesoTotalKg, pesoTotalArroba, unidade) : '—';
  const gmdValor = unidade === 'kg' ? gmdMedio : gmdMedio != null ? gmdMedio / 15 : null;
  const gmdStr = gmdValor != null
    ? `${gmdValor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${labelGMD(unidade)}`
    : 'sem GMD';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: lote.cor }]} />
        <Text style={styles.nome} numberOfLines={1}>{lote.nome}</Text>
        <View style={[styles.statusPill, { backgroundColor: statusColor[status] }]}>
          <Text style={styles.statusTxt}>{statusEmoji(status)}</Text>
        </View>
        <Pressable onPress={onDelete} hitSlop={12} style={styles.lixeira}>
          <Text style={styles.lixeiraIcon}>🗑️</Text>
        </Pressable>
      </View>

      <View style={styles.linhas}>
        <Linha label="Animais" valor={String(totalAnimais)} />
        <Linha label="Peso médio" valor={pesoMedio} />
        <Linha label="Peso total" valor={pesoTotal} />
        <Linha label="GMD médio" valor={gmdStr} />
      </View>

      <View style={styles.badges}>
        <Badge emoji="🟢" n={badges.excelente} />
        <Badge emoji="🟡" n={badges.meta} />
        <Badge emoji="🔴" n={badges.abaixo} />
        <Badge emoji="⚪" n={badges['sem-dados']} />
      </View>
    </Pressable>
  );
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.linhaLabel}>{label}</Text>
      <Text style={styles.linhaValor}>{valor}</Text>
    </View>
  );
}

function Badge({ emoji, n }: { emoji: string; n: number }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeEmoji}>{emoji}</Text>
      <Text style={styles.badgeN}>{n}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: { opacity: 0.85 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  nome: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  statusTxt: { fontSize: 14 },
  lixeira: { padding: spacing.xs },
  lixeiraIcon: { fontSize: 20 },
  linhas: { gap: spacing.xs },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linhaLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  linhaValor: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeEmoji: { fontSize: 14 },
  badgeN: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
});
