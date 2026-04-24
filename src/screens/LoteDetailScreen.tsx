import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AnimaisTable } from '../components/AnimaisTable';
import {
  listAnimaisComStats,
  ordenarAnimais,
  type AnimalStats,
  type OrdemAnimais,
} from '../db/analytics/animalStats';
import { computeLoteStats, type LoteStats } from '../db/analytics/loteStats';
import { lotesRepo } from '../db/repos';
import { useAppStore } from '../store/appStore';
import { colors, radius, spacing, statusColor, typography } from '../theme';
import { formatPeso, labelGMD } from '../utils/peso';
import { statusEmoji, statusLabel } from '../utils/gmd';
import type { RootStackParamList } from '../navigation/types';

export function LoteDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'LoteDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const unidade = useAppStore((s) => s.unidade);
  const metaGMD = useAppStore((s) => s.metaGMD);

  const [stats, setStats] = useState<LoteStats | null>(null);
  const [animais, setAnimais] = useState<AnimalStats[]>([]);
  const [ordem, setOrdem] = useState<OrdemAnimais>('peso-desc');
  const [carregando, setCarregando] = useState(true);
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [metaInput, setMetaInput] = useState('');

  const carregar = useCallback(async () => {
    const loteStats = await computeLoteStats(route.params.loteId, metaGMD);
    setStats(loteStats);
    const lista = await listAnimaisComStats(route.params.loteId, metaGMD, loteStats.lote.peso_abate);
    setAnimais(ordenarAnimais(lista, ordem));
    setCarregando(false);
    if (!editandoMeta) {
      setMetaInput(
        loteStats.lote.peso_abate != null ? String(loteStats.lote.peso_abate) : ''
      );
    }
  }, [route.params.loteId, metaGMD, ordem, editandoMeta]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  if (carregando || !stats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  function changeOrdem(nova: OrdemAnimais) {
    setOrdem(nova);
    setAnimais((atual) => ordenarAnimais(atual, nova));
  }

  function irPesar(a: AnimalStats) {
    navigation.navigate('Tabs', {
      screen: 'Pesar',
      params: { loteId: stats!.lote.id, codigo: a.animal.codigo },
    } as never);
  }

  function irHistorico(a: AnimalStats) {
    navigation.navigate('AnimalHistorico', { animalId: a.animal.id });
  }

  async function salvarMeta() {
    const limpo = metaInput.replace(',', '.').trim();
    const n = limpo === '' ? null : Number(limpo);
    if (limpo !== '' && (!Number.isFinite(n) || (n ?? 0) <= 0)) {
      Alert.alert('Meta de abate', 'Informe um peso válido.');
      setMetaInput(stats!.lote.peso_abate != null ? String(stats!.lote.peso_abate) : '');
      return;
    }
    try {
      await lotesRepo.updateLote(stats!.lote.id, { peso_abate: n });
      setEditandoMeta(false);
      await carregar();
    } catch (e) {
      Alert.alert('Meta de abate', e instanceof Error ? e.message : 'Falha ao salvar.');
    }
  }

  const pesoMedio = stats.totalAnimais > 0
    ? formatPeso(stats.pesoMedioKg, stats.pesoMedioArroba, unidade)
    : '—';
  const pesoTotal = stats.totalAnimais > 0
    ? formatPeso(stats.pesoTotalKg, stats.pesoTotalArroba, unidade)
    : '—';
  const gmdValor = unidade === 'kg' ? stats.gmdMedio : stats.gmdMedio != null ? stats.gmdMedio / 15 : null;
  const gmdExibido = gmdValor != null
    ? `${gmdValor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${labelGMD(unidade)}`
    : 'sem GMD';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.cabecalho}>
        <View style={[styles.dot, { backgroundColor: stats.lote.cor }]} />
        <Text style={styles.nome} numberOfLines={1}>{stats.lote.nome}</Text>
        <View style={[styles.statusPill, { backgroundColor: statusColor[stats.status] }]}>
          <Text style={styles.statusTxt}>
            {statusEmoji(stats.status)} {statusLabel(stats.status)}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        <InfoBox label="Animais" valor={String(stats.totalAnimais)} />
        <InfoBox label="Peso médio" valor={pesoMedio} />
        <InfoBox label="Peso total" valor={pesoTotal} />
        <InfoBox label="GMD médio" valor={gmdExibido} />
      </View>

      <View style={styles.metaCard}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Peso de abate do lote</Text>
          {editandoMeta ? (
            <View style={styles.metaEditRow}>
              <TextInput
                style={styles.metaInput}
                value={metaInput}
                onChangeText={setMetaInput}
                keyboardType="decimal-pad"
                autoFocus
                onBlur={salvarMeta}
                onSubmitEditing={salvarMeta}
                returnKeyType="done"
                placeholder="—"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.metaSuf}>kg</Text>
            </View>
          ) : (
            <Text
              style={styles.metaValor}
              onPress={() => setEditandoMeta(true)}
              suppressHighlighting
            >
              {stats.lote.peso_abate != null ? `${stats.lote.peso_abate} kg` : 'definir'}
            </Text>
          )}
        </View>
        {stats.lote.peso_abate != null ? (
          <Text style={styles.prontos}>
            {stats.prontosParaAbate} de {stats.totalAnimais} prontos para abate
          </Text>
        ) : (
          <Text style={styles.prontosHint}>
            Defina o peso de abate para acompanhar quem já atingiu a meta.
          </Text>
        )}
      </View>

      <AnimaisTable
        animais={animais}
        unidade={unidade}
        ordem={ordem}
        onChangeOrdem={changeOrdem}
        onPesar={irPesar}
        onHistorico={irHistorico}
      />
    </ScrollView>
  );
}

function InfoBox({ label, valor }: { label: string; valor: string }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValor} numberOfLines={1}>{valor}</Text>
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
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dot: { width: 14, height: 14, borderRadius: 7 },
  nome: { ...typography.h1, color: colors.textPrimary, flex: 1 },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusTxt: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoBox: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoValor: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  metaValor: {
    ...typography.h3,
    color: colors.primary,
  },
  metaEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaInput: {
    ...typography.h3,
    color: colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    minWidth: 80,
    textAlign: 'right',
    paddingVertical: 2,
  },
  metaSuf: {
    ...typography.body,
    color: colors.textSecondary,
  },
  prontos: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  prontosHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
