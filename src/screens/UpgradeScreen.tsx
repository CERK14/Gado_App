import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { PurchasesPackage } from 'react-native-purchases';
import { Button } from '../components/Button';
import {
  carregarOfertas,
  comprarPacote,
  isRevenueCatConfigured,
  restorePurchases,
} from '../services/revenuecat';
import { useAppStore } from '../store/appStore';
import { colors, radius, spacing, typography } from '../theme';

type Oferta = {
  pacote: PurchasesPackage | null;
  titulo: string;
  preco: string;
  descricao?: string;
  destaque?: boolean;
};

const OFERTAS_PADRAO: Oferta[] = [
  {
    pacote: null,
    titulo: 'Mensal',
    preco: 'R$ 29,90/mês',
  },
  {
    pacote: null,
    titulo: 'Anual',
    preco: 'R$ 249,00/ano',
    descricao: 'Equivale a R$ 20,75/mês — 30% de desconto',
    destaque: true,
  },
  {
    pacote: null,
    titulo: 'Vitalício',
    preco: 'R$ 490,00',
    descricao: 'Pagamento único, acesso para sempre',
  },
];

function pacoteParaOferta(p: PurchasesPackage): Oferta {
  const period = p.product.subscriptionPeriod ?? '';
  const titulo = period.includes('Y')
    ? 'Anual'
    : period.includes('M')
    ? 'Mensal'
    : 'Vitalício';
  return {
    pacote: p,
    titulo,
    preco: p.product.priceString,
    descricao: p.product.description || undefined,
    destaque: titulo === 'Anual',
  };
}

export function UpgradeScreen() {
  const navigation = useNavigation();
  const plano = useAppStore((s) => s.plano);

  const [ofertas, setOfertas] = useState<Oferta[]>(OFERTAS_PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [comprando, setComprando] = useState<string | null>(null);
  const [restaurando, setRestaurando] = useState(false);
  const [revenueCatPronto, setRevenueCatPronto] = useState(isRevenueCatConfigured());

  useEffect(() => {
    (async () => {
      try {
        const oferta = await carregarOfertas();
        if (oferta && oferta.availablePackages.length > 0) {
          setOfertas(oferta.availablePackages.map(pacoteParaOferta));
          setRevenueCatPronto(true);
        }
      } catch (e) {
        console.warn('[upgrade] falha ao carregar ofertas', e);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  async function comprar(o: Oferta) {
    if (!o.pacote || !revenueCatPronto) {
      Alert.alert(
        'Pagamentos indisponíveis',
        'A integração com a loja não está configurada nesta build. Configure o RevenueCat e os produtos no Google Play / App Store.'
      );
      return;
    }
    setComprando(o.titulo);
    try {
      const status = await comprarPacote(o.pacote);
      if (status === 'comprado') {
        Alert.alert('Bem-vindo ao Pro 🚀', 'Tudo liberado. Bom manejo!');
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Compra', e instanceof Error ? e.message : 'Falha ao comprar.');
    } finally {
      setComprando(null);
    }
  }

  async function restaurar() {
    setRestaurando(true);
    try {
      const r = await restorePurchases();
      if (r === 'restaurado') {
        Alert.alert('Tudo certo', 'Seu acesso Pro foi restaurado.');
        navigation.goBack();
      } else if (r === 'sem-compras') {
        Alert.alert('Restaurar compra', 'Não encontramos compras nessa conta.');
      } else {
        Alert.alert('Restaurar compra', 'Pagamentos não estão configurados nesta build.');
      }
    } catch (e) {
      Alert.alert('Restaurar compra', e instanceof Error ? e.message : 'Falha.');
    } finally {
      setRestaurando(false);
    }
  }

  if (plano === 'pro') {
    return (
      <View style={styles.center}>
        <Text style={styles.proEmoji}>🚀</Text>
        <Text style={styles.proTitulo}>Você já é Pro</Text>
        <Text style={styles.proMsg}>Tudo liberado. Bom manejo!</Text>
        <Button label="Voltar" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heroBox}>
        <Text style={styles.heroEmoji}>🚀</Text>
        <Text style={styles.heroTitulo}>GadoApp Pro</Text>
        <Text style={styles.heroSub}>Tudo do gratuito + sem limites + projeção de abate + exportação.</Text>
      </View>

      <View style={styles.beneficios}>
        <Beneficio txt="Lotes ilimitados" />
        <Beneficio txt="Animais ilimitados" />
        <Beneficio txt="Histórico completo de pesagens" />
        <Beneficio txt="Projeção de abate com gráfico" />
        <Beneficio txt="Exportação de dados (PDF/planilha)" />
        <Beneficio txt="Suporte prioritário" />
      </View>

      <View style={styles.planos}>
        {ofertas.map((o) => (
          <Pressable
            key={o.titulo}
            onPress={() => comprar(o)}
            disabled={comprando !== null}
            style={({ pressed }) => [
              styles.plano,
              o.destaque && styles.planoDestaque,
              pressed && !comprando && styles.planoPressed,
            ]}
          >
            {o.destaque ? (
              <View style={styles.tagDestaque}>
                <Text style={styles.tagDestaqueTxt}>MELHOR ESCOLHA</Text>
              </View>
            ) : null}
            <Text style={styles.planoTitulo}>{o.titulo}</Text>
            <Text style={styles.planoPreco}>{o.preco}</Text>
            {o.descricao ? <Text style={styles.planoDesc}>{o.descricao}</Text> : null}
            <View style={styles.planoBotao}>
              <Text style={styles.planoBotaoTxt}>
                {comprando === o.titulo ? 'Processando...' : 'Assinar'}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {!revenueCatPronto && !carregando ? (
        <Text style={styles.aviso}>
          A loja ainda não foi configurada nesta build. Os preços acima são os definitivos
          do GadoApp Pro; a compra real é liberada após configurar o RevenueCat.
        </Text>
      ) : null}

      <Button
        label={restaurando ? 'Restaurando...' : 'Restaurar compra'}
        variant="ghost"
        onPress={restaurar}
        loading={restaurando}
      />
    </ScrollView>
  );
}

function Beneficio({ txt }: { txt: string }) {
  return (
    <View style={styles.beneficioRow}>
      <Text style={styles.check}>✓</Text>
      <Text style={styles.beneficioTxt}>{txt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.md,
  },
  heroBox: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  heroEmoji: { fontSize: 56 },
  heroTitulo: { ...typography.h1, color: colors.textPrimary },
  heroSub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  beneficios: { gap: spacing.sm },
  beneficioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  check: { color: colors.primary, fontSize: 18, fontWeight: '700' },
  beneficioTxt: { ...typography.body, color: colors.textPrimary },
  planos: { gap: spacing.md },
  plano: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  planoDestaque: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.weightScaleBg,
  },
  planoPressed: { opacity: 0.85 },
  tagDestaque: {
    position: 'absolute',
    top: -10,
    right: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  tagDestaqueTxt: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  planoTitulo: { ...typography.h2, color: colors.textPrimary },
  planoPreco: { ...typography.h3, color: colors.primary },
  planoDesc: { ...typography.caption, color: colors.textSecondary },
  planoBotao: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  planoBotaoTxt: {
    ...typography.button,
    color: colors.textInverse,
  },
  aviso: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  proEmoji: { fontSize: 64 },
  proTitulo: { ...typography.h1, color: colors.textPrimary },
  proMsg: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
