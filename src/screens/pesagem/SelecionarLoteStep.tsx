import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import type { LoteRow } from '../../db/types';
import { colors, radius, spacing, typography } from '../../theme';

type Props = {
  lotes: LoteRow[];
  ultimoLoteId: string | null;
  onSelect: (lote: LoteRow) => void;
};

export function SelecionarLoteStep({ lotes, ultimoLoteId, onSelect }: Props) {
  const ultimo = lotes.find((l) => l.id === ultimoLoteId) ?? null;
  const outros = lotes.filter((l) => l.id !== ultimo?.id);

  if (lotes.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitulo}>Nenhum lote ainda</Text>
        <Text style={styles.emptyTxt}>Crie um lote na aba Lotes para começar a pesar.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {ultimo ? (
        <View style={styles.destaque}>
          <Text style={styles.destaqueLabel}>Último lote pesado</Text>
          <View style={styles.destaqueRow}>
            <View style={[styles.dot, { backgroundColor: ultimo.cor }]} />
            <Text style={styles.destaqueNome}>{ultimo.nome}</Text>
          </View>
          <Button label="Continuar" onPress={() => onSelect(ultimo)} />
        </View>
      ) : null}

      {outros.length > 0 ? (
        <View style={styles.grupo}>
          <Text style={styles.grupoLabel}>{ultimo ? 'Outros lotes' : 'Escolha um lote'}</Text>
          {outros.map((l) => (
            <Pressable
              key={l.id}
              onPress={() => onSelect(l)}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            >
              <View style={[styles.dot, { backgroundColor: l.cor }]} />
              <Text style={styles.itemNome}>{l.nome}</Text>
              <Text style={styles.itemSeta}>›</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
    flexGrow: 1,
  },
  destaque: {
    backgroundColor: colors.weightScaleBg,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  destaqueLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  destaqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  destaqueNome: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  grupo: { gap: spacing.sm },
  grupoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  itemPressed: { opacity: 0.85 },
  itemNome: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  itemSeta: {
    ...typography.h2,
    color: colors.textSecondary,
  },
  dot: { width: 14, height: 14, borderRadius: 7 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitulo: { ...typography.h2, color: colors.textPrimary },
  emptyTxt: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
