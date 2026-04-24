import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import type { Unidade } from '../utils/peso';

type Props = {
  value: Unidade;
  onChange: (u: Unidade) => void;
};

const OPCOES: { unidade: Unidade; label: string }[] = [
  { unidade: 'kg', label: 'Quilos (kg)' },
  { unidade: '@', label: 'Arrobas (@)' },
];

export function UnitToggle({ value, onChange }: Props) {
  return (
    <View style={styles.group}>
      {OPCOES.map((op) => {
        const ativo = value === op.unidade;
        return (
          <Pressable
            key={op.unidade}
            onPress={() => onChange(op.unidade)}
            style={[styles.item, ativo && styles.itemAtivo]}
            accessibilityRole="button"
            accessibilityState={{ selected: ativo }}
          >
            <Text style={[styles.label, ativo && styles.labelAtivo]}>{op.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  item: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  itemAtivo: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
  },
  labelAtivo: {
    color: colors.textInverse,
  },
});
