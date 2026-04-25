import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { NumberField } from '../components/NumberField';
import { UnitToggle } from '../components/UnitToggle';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../store/appStore';
import { restorePurchases } from '../services/revenuecat';
import { colors, radius, spacing, typography } from '../theme';
import type { Unidade } from '../utils/peso';
import type { RootStackParamList } from '../navigation/types';

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const auth = useAuth();
  const user = useAppStore((s) => s.user);
  const unidade = useAppStore((s) => s.unidade);
  const metaGMD = useAppStore((s) => s.metaGMD);
  const pesoAbate = useAppStore((s) => s.pesoAbate);
  const precoKg = useAppStore((s) => s.precoKg);
  const plano = useAppStore((s) => s.plano);
  const atualizarConfig = useAppStore((s) => s.atualizarConfig);
  const [restaurando, setRestaurando] = useState(false);

  async function salvar(patch: Parameters<typeof atualizarConfig>[0]) {
    try {
      await atualizarConfig(patch);
    } catch (e) {
      Alert.alert('Configurações', e instanceof Error ? e.message : 'Falha ao salvar.');
    }
  }

  async function trocarUnidade(nova: Unidade) {
    if (nova === unidade) return;
    await salvar({ unidade: nova });
  }

  function confirmarLogout() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => auth.signOut() },
    ]);
  }

  async function handleRestaurar() {
    setRestaurando(true);
    try {
      const resultado = await restorePurchases();
      if (!resultado) {
        Alert.alert(
          'Restaurar compra',
          'RevenueCat não está configurado nesta build.'
        );
        return;
      }
      Alert.alert('Restaurar compra', 'Compras restauradas com sucesso.');
    } catch (e) {
      Alert.alert('Restaurar compra', e instanceof Error ? e.message : 'Falha ao restaurar.');
    } finally {
      setRestaurando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Section titulo="Manejo">
        <NumberField
          label="Meta de GMD"
          value={metaGMD}
          sufixo="kg/dia"
          min={0}
          max={10}
          decimais={2}
          hint="Ganho de peso por dia. Afeta os cálculos de performance."
          onSave={(n) => salvar({ meta_gmd: n })}
        />
        <Divider />
        <NumberField
          label="Peso de abate padrão"
          value={pesoAbate}
          sufixo="kg"
          min={0}
          max={2000}
          decimais={0}
          hint="Usado como padrão ao criar novos lotes."
          onSave={(n) => salvar({ peso_abate: n })}
        />
      </Section>

      <Section titulo="Financeiro">
        <NumberField
          label="Preço do kg vivo"
          value={precoKg}
          sufixo="R$"
          min={0}
          max={1000}
          decimais={2}
          hint="Usado no cálculo do valor estimado do ganho."
          onSave={(n) => salvar({ preco_kg: n })}
        />
      </Section>

      <Section titulo="Unidade de peso">
        <UnitToggle value={unidade} onChange={trocarUnidade} />
      </Section>

      <Section titulo="Plano">
        <View style={styles.linhaInfo}>
          <Text style={styles.label}>Plano atual</Text>
          <Text style={styles.valor}>{plano === 'pro' ? 'Pro' : 'Gratuito'}</Text>
        </View>
        {plano === 'free' ? (
          <Button label="Fazer upgrade" onPress={() => navigation.navigate('Upgrade')} />
        ) : null}
        <Button
          label={restaurando ? 'Restaurando...' : 'Restaurar compra'}
          variant="secondary"
          onPress={handleRestaurar}
          loading={restaurando}
        />
      </Section>

      <Section titulo="Conta">
        <View style={styles.linhaInfo}>
          <Text style={styles.label}>E-mail</Text>
          <Text style={styles.valor}>{user?.email ?? '—'}</Text>
        </View>
        <Button label="Sair" variant="secondary" onPress={confirmarLogout} />
      </Section>
    </ScrollView>
  );
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitulo}>{titulo}</Text>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
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
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitulo: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  cardBody: {
    gap: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  linhaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
  valor: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
});
