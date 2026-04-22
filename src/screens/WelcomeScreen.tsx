import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, typography } from '../theme';
import type { AuthStackParamList } from '../navigation/types';

export function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const auth = useAuth();
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);

  async function handleGoogle() {
    setBusy('google');
    try {
      await auth.signInWithGoogle();
    } catch (e) {
      Alert.alert('Entrar com Google', e instanceof Error ? e.message : 'Falha ao entrar.');
    } finally {
      setBusy(null);
    }
  }

  async function handleApple() {
    setBusy('apple');
    try {
      await auth.signInWithApple();
    } catch (e) {
      Alert.alert('Entrar com Apple', e instanceof Error ? e.message : 'Falha ao entrar.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.logo}>🐄</Text>
          <Text style={styles.titulo}>Bem-vindo ao GadoApp</Text>
          <Text style={styles.subtitulo}>
            Registre o peso do seu gado, acompanhe o ganho e saiba quais lotes estão performando.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Entrar com Google"
            leftIcon="G"
            onPress={handleGoogle}
            loading={busy === 'google'}
          />
          {auth.appleAvailable ? (
            <Button
              label="Entrar com Apple"
              leftIcon=""
              variant="secondary"
              onPress={handleApple}
              loading={busy === 'apple'}
            />
          ) : null}
          <Button
            label="Entrar com e-mail"
            leftIcon="✉️"
            variant="secondary"
            onPress={() => navigation.navigate('EmailAuth', { mode: 'signIn' })}
          />
        </View>

        <Text style={styles.termos}>Ao continuar, você concorda com os Termos de Uso.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logo: { fontSize: 96, marginBottom: spacing.lg },
  titulo: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitulo: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  actions: {
    gap: spacing.md,
    marginVertical: spacing.xxl,
  },
  termos: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
