import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

type Props = {
  emoji: string;
  titulo: string;
  descricao: string;
};

export function PlaceholderScreen({ emoji, titulo, descricao }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.descricao}>{descricao}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  titulo: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  descricao: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
