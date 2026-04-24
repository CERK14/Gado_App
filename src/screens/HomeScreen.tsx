import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { listLotesComStats, type LoteComStats } from '../db/analytics/loteStats';
import { computeRebanhoStats, type RebanhoStats } from '../db/analytics/rebanhoStats';
import { lotesRepo } from '../db/repos';
import type { LoteRow } from '../db/types';
import { useAppStore } from '../store/appStore';
import { getLastLoteId } from '../utils/lastLote';
import { formatPeso, labelGMD, type Unidade } from '../utils/peso';
import { statusEmoji, statusLabel } from '../utils/gmd';
import { colors, radius, spacing, statusColor, typography } from '../theme';
import type { RootStackParamList, TabsParamList } from '../navigation/types';

export function HomeScreen() {
  const tabsNav = useNavigation<BottomTabNavigationProp<TabsParamList, 'Início'>>();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const unidade: Unidade = useAppStore((s) => s.unidade);
  const metaGMD = useAppStore((s) => s.metaGMD);

  const [lotes, setLotes] = useState<LoteComStats[]>([]);
  const [rebanho, setRebanho] = useState<RebanhoStats | null>(null);
  const [ultimoLote, setUltimoLote] = useState<LoteRow | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const [ls, rb, lastId] = await Promise.all([
      listLotesComStats(metaGMD),
      computeRebanhoStats(metaGMD),
      getLastLoteId(),
    ]);
    setLotes(ls);
    setRebanho(rb);
    if (lastId) {
      const lote = await lotesRepo.getLote(lastId);
      setUltimoLote(lote);
    } else {
      setUltimoLote(null);
    }
    setCarregando(false);
  }, [metaGMD]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  function abrirPesagem() {
    if (ultimoLote) {
      tabsNav.navigate('Pesar', { loteId: ultimoLote.id });
    } else {
      tabsNav.navigate('Pesar');
    }
  }

  const gmdGeral = rebanho?.gmdMedioGeral;
  const gmdExibido =
    gmdGeral == null
      ? 'sem GMD ainda'
      : `${(unidade === 'kg' ? gmdGeral : gmdGeral / 15).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${labelGMD(unidade)}`;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Button
        label={
          ultimoLote
            ? `⚖️ Continuar pesagem — ${ultimoLote.nome}`
            : '⚖️ Começar primeira pesagem'
        }
        onPress={abrirPesagem}
        style={styles.btnPrincipal}
      />

      {lotes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🐄</Text>
          <Text style={styles.emptyTitulo}>Seu rebanho começa aqui</Text>
          <Text style={styles.emptyTxt}>
            Crie um lote na aba Lotes para registrar sua primeira pesagem.
          </Text>
        </View>
      ) : (
        <View style={styles.lista}>
          <Text style={styles.grupoLabel}>Seus lotes</Text>
          {lotes.map((l) => (
            <Pressable
              key={l.lote.id}
              onPress={() => rootNav.navigate('LoteDetail', { loteId: l.lote.id })}
              style={({ pressed }) => [styles.linha, pressed && styles.linhaPressed]}
            >
              <View style={[styles.statusDot, { backgroundColor: statusColor[l.status] }]} />
              <View style={[styles.corDot, { backgroundColor: l.lote.cor }]} />
              <View style={styles.linhaInfo}>
                <Text style={styles.linhaNome} numberOfLines={1}>{l.lote.nome}</Text>
                <Text style={styles.linhaSub}>
                  {l.totalAnimais} animal{l.totalAnimais === 1 ? '' : 'is'}
                  {l.totalAnimais > 0
                    ? ` · ${formatPeso(l.pesoMedioKg, l.pesoMedioArroba, unidade)} médio`
                    : ''}
                </Text>
              </View>
              <Text style={styles.seta}>›</Text>
            </Pressable>
          ))}
        </View>
      )}

      {rebanho ? (
        <View style={styles.rebanhoCard}>
          <Text style={styles.rebanhoTitulo}>Rebanho</Text>
          <View style={styles.rebanhoRow}>
            <View style={styles.rebanhoInfo}>
              <Text style={styles.rebanhoNum}>{rebanho.totalAnimais}</Text>
              <Text style={styles.rebanhoLabel}>animal{rebanho.totalAnimais === 1 ? '' : 'is'}</Text>
            </View>
            <View style={styles.rebanhoInfo}>
              <Text style={styles.rebanhoNum}>{gmdExibido}</Text>
              <Text style={styles.rebanhoLabel}>
                {statusEmoji(rebanho.statusGeral)} {statusLabel(rebanho.statusGeral)}
              </Text>
            </View>
          </View>
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
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  btnPrincipal: {
    minHeight: 64,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyEmoji: { fontSize: 64 },
  emptyTitulo: { ...typography.h2, color: colors.textPrimary },
  emptyTxt: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  lista: { gap: spacing.sm },
  grupoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  linhaPressed: { opacity: 0.85 },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  corDot: {
    width: 8,
    height: 32,
    borderRadius: 4,
  },
  linhaInfo: { flex: 1 },
  linhaNome: { ...typography.h3, color: colors.textPrimary },
  linhaSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  seta: { ...typography.h2, color: colors.textSecondary },
  rebanhoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  rebanhoTitulo: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rebanhoRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  rebanhoInfo: { flex: 1 },
  rebanhoNum: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  rebanhoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
