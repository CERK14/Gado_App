import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../store/appStore';
import { colors, radius, spacing, typography } from '../theme';

export function SettingsScreen() {
  const auth = useAuth();
  const user = useAppStore((s) => s.user);

  function confirmarLogout() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => auth.signOut() },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Conta</Text>
        <Text style={styles.linha}>{user?.email ?? 'Sem e-mail'}</Text>
        <Text style={styles.aviso}>
          Meta de GMD, peso de abate, preço do kg e unidade aparecem aqui na Etapa 4.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Sessão</Text>
        <Button label="Sair" variant="secondary" onPress={confirmarLogout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardTitulo: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  linha: {
    ...typography.body,
    color: colors.textPrimary,
  },
  aviso: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
