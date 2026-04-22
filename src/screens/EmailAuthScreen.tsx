import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { colors, radius, spacing, typography } from '../theme';
import type { AuthStackParamList } from '../navigation/types';

type Mode = 'signIn' | 'signUp';

export function EmailAuthScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<AuthStackParamList, 'EmailAuth'>>();
  const [mode, setMode] = useState<Mode>(route.params?.mode ?? 'signIn');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [busy, setBusy] = useState(false);
  const auth = useAuth();

  const titulo = mode === 'signIn' ? 'Entrar com e-mail' : 'Criar conta';
  const botao = mode === 'signIn' ? 'Entrar' : 'Criar conta';

  const podeEnviar = email.includes('@') && senha.length >= 6 && !busy;

  async function handleSubmit() {
    setBusy(true);
    try {
      if (mode === 'signIn') {
        await auth.signInWithEmail(email.trim(), senha);
      } else {
        await auth.signUpWithEmail(email.trim(), senha);
        Alert.alert(
          'Confirme seu e-mail',
          'Enviamos um link de confirmação. Abra-o para liberar o acesso.'
        );
      }
    } catch (e) {
      Alert.alert(titulo, e instanceof Error ? e.message : 'Falha ao continuar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.titulo}>{titulo}</Text>

          <View style={styles.form}>
            <View>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="voce@exemplo.com"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                placeholder="mínimo 6 caracteres"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <Button
              label={botao}
              onPress={handleSubmit}
              loading={busy}
              disabled={!podeEnviar}
            />

            <Pressable
              onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
              hitSlop={8}
            >
              <Text style={styles.toggle}>
                {mode === 'signIn'
                  ? 'Não tem conta? Criar agora'
                  : 'Já tem conta? Entrar'}
              </Text>
            </Pressable>
          </View>

          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={styles.voltar}>Voltar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  titulo: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  toggle: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  voltar: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
