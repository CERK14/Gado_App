import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { MetaVsRealBar } from '../components/MetaVsRealBar';
import type { RootStackParamList } from '../navigation/types';
import {
  computeGanhoTotal,
  computeMetaVsReal,
  computeProjecoesAbate,
  type GanhoTotal,
  type MetaVsRealLote,
  type ProjecaoAbateLote,
} from '../db/analytics/relatorios';
import { useAppStore } from '../store/appStore';
import { podeVerProjecaoAbate } from '../utils/freemium';
import { formatPeso, labelGMD, labelPeso, type Unidade } from '../utils/peso';
import { colors, radius, spacing, typography } from '../theme';

function formatBrDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatReais(v: number): string {
  return `R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`;
}

export function ReportsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const unidade: Unidade = useAppStore((s) => s.unidade);
  const metaGMD = useAppStore((s) => s.metaGMD);
  const precoKg = useAppStore((s) => s.precoKg);
  const plano = useAppStore((s) => s.plano);

  const [ganho, setGanho] = useState<GanhoTotal | null>(null);
  const [metaVsReal, setMetaVsReal] = useState<MetaVsRealLote[]>([]);
  const [projecoes, setProjecoes] = useState<ProjecaoAbateLote[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const [g, mvr, proj] = await Promise.all([
      computeGanhoTotal(precoKg),
      computeMetaVsReal(metaGMD),
      computeProjecoesAbate(metaGMD, precoKg),
    ]);
    setGanho(g);
    setMetaVsReal(mvr);
    setProjecoes(proj);
    setCarregando(false);
  }, [metaGMD, precoKg]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  if (carregando || !ganho) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const ganhoExibido = formatPeso(ganho.ganhoKg, ganho.ganhoArroba, unidade);
  const lotesComDados = metaVsReal.filter((l) => l.animaisConsiderados > 0);
  const acessoProjecao = podeVerProjecaoAbate(plano);
  const sufixoPeso = labelPeso(unidade).replace('Peso ', '').replace('(', '').replace(')', '');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.resumoRow}>
        <View style={styles.resumoCard}>
          <Text style={styles.resumoLabel}>Ganho total</Text>
          <Text style={styles.resumoValor}>{ganhoExibido}</Text>
          <Text style={styles.resumoSub}>
            {ganho.animaisConsiderados} animal{ganho.animaisConsiderados === 1 ? '' : 'is'} com 2+ pesagens
          </Text>
        </View>
        <View style={styles.resumoCard}>
          <Text style={styles.resumoLabel}>Valor estimado</Text>
          <Text style={styles.resumoValor}>
            {ganho.valorReais != null ? formatReais(ganho.valorReais) : '—'}
          </Text>
          <Text style={styles.resumoSub}>Ganho × preço do kg</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Meta vs Real</Text>
        <Text style={styles.cardSub}>
          Ganho de peso real comparado à meta de GMD configurada, no mesmo período.
        </Text>
        {lotesComDados.length === 0 ? (
          <Text style={styles.vazio}>Registre pelo menos 2 pesagens em algum lote para ver o comparativo.</Text>
        ) : (
          <View style={styles.listaBarras}>
            {lotesComDados.map((l) => {
              const realExibido = unidade === 'kg' ? l.ganhoRealKg : l.ganhoRealKg / 15;
              const metaExibida = unidade === 'kg' ? l.ganhoMetaKg : l.ganhoMetaKg / 15;
              return (
                <MetaVsRealBar
                  key={l.lote.id}
                  nome={l.lote.nome}
                  cor={l.lote.cor}
                  real={realExibido}
                  meta={metaExibida}
                  sufixo={sufixoPeso}
                />
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Projeção de abate</Text>

        {!acessoProjecao.permitido ? (
          <View style={styles.bloqueio}>
            <Text style={styles.bloqueioEmoji}>🔒</Text>
            <Text style={styles.bloqueioMsg}>{acessoProjecao.mensagem}</Text>
            <Button label="Fazer upgrade" onPress={() => navigation.navigate('Upgrade')} />
          </View>
        ) : projecoes.length === 0 ? (
          <Text style={styles.vazio}>
            Defina o peso de abate nos lotes para ver a projeção.
          </Text>
        ) : (
          <View style={styles.listaProj}>
            {projecoes.map((p) => (
              <View key={p.lote.id} style={styles.projRow}>
                <View style={styles.projHeader}>
                  <View style={[styles.dot, { backgroundColor: p.lote.cor }]} />
                  <Text style={styles.projNome}>{p.lote.nome}</Text>
                  <View style={[styles.tag, p.usandoGmdReal ? styles.tagReal : styles.tagEstimativa]}>
                    <Text style={[styles.tagTxt, p.usandoGmdReal ? styles.tagTxtReal : styles.tagTxtEstimativa]}>
                      {p.usandoGmdReal ? 'Real' : 'Estimativa'}
                    </Text>
                  </View>
                </View>

                <View style={styles.projInfos}>
                  <InfoLinha
                    label="Peso atual (médio)"
                    valor={formatPeso(p.pesoMedioAtualKg, p.pesoMedioAtualKg / 15, unidade)}
                  />
                  <InfoLinha
                    label="Meta de abate"
                    valor={formatPeso(p.pesoAbateKg, p.pesoAbateKg / 15, unidade)}
                  />
                  <InfoLinha
                    label={p.usandoGmdReal ? 'GMD real usado' : 'GMD usado (meta)'}
                    valor={`${(unidade === 'kg' ? p.gmdUsadoKg : p.gmdUsadoKg / 15).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${labelGMD(unidade)}`}
                  />
                  <InfoLinha
                    label="Dias restantes"
                    valor={p.diasRestantes == null ? '—' : p.diasRestantes === 0 ? 'já pronto' : `${p.diasRestantes} dia(s)`}
                  />
                  <InfoLinha
                    label="Data prevista"
                    valor={p.dataPrevista ? formatBrDate(p.dataPrevista) : '—'}
                  />
                  {p.valorEstimadoReais != null ? (
                    <InfoLinha
                      label="Valor estimado do lote"
                      valor={formatReais(p.valorEstimadoReais)}
                    />
                  ) : null}
                </View>

                {!p.usandoGmdReal ? (
                  <Text style={styles.aviso}>
                    Estimativa baseada na meta. Registre mais uma pesagem para usar o ritmo real.
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function InfoLinha({ label, valor }: { label: string; valor: string }) {
  return (
    <View style={styles.infoLinha}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValor}>{valor}</Text>
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
  resumoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  resumoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 4,
  },
  resumoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  resumoValor: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  resumoSub: {
    ...typography.caption,
    color: colors.textSecondary,
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
  cardSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  vazio: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  listaBarras: { gap: spacing.lg },
  listaProj: { gap: spacing.lg },
  projRow: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  projHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  projNome: { ...typography.h3, color: colors.textPrimary, flex: 1 },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  tagReal: { backgroundColor: colors.primary },
  tagEstimativa: { backgroundColor: colors.weightScaleBg, borderWidth: 1, borderColor: colors.border },
  tagTxt: { ...typography.caption, fontWeight: '600' },
  tagTxtReal: { color: colors.textInverse },
  tagTxtEstimativa: { color: colors.textSecondary },
  projInfos: { gap: spacing.xs },
  infoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: { ...typography.body, color: colors.textSecondary },
  infoValor: { ...typography.bodyStrong, color: colors.textPrimary },
  aviso: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  bloqueio: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  bloqueioEmoji: { fontSize: 40 },
  bloqueioMsg: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
