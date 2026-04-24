import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRoute, type RouteProp } from '@react-navigation/native';
import { LineChart, type ChartPoint } from '../components/LineChart';
import { animaisRepo, pesagensRepo } from '../db/repos';
import type { AnimalRow, PesagemRow } from '../db/types';
import { useAppStore } from '../store/appStore';
import { colors, radius, spacing, typography } from '../theme';
import { formatPeso, labelGMD, labelPeso, type Unidade } from '../utils/peso';
import type { RootStackParamList } from '../navigation/types';

type LinhaHistorico = {
  pesagem: PesagemRow;
  gmdDesdeAnterior: number | null;
  diasDesdeAnterior: number | null;
};

function calcularLinhas(pesagens: PesagemRow[]): LinhaHistorico[] {
  return pesagens.map((p, i) => {
    if (i === 0) return { pesagem: p, gmdDesdeAnterior: null, diasDesdeAnterior: null };
    const anterior = pesagens[i - 1];
    const dias = Math.max(
      0,
      (new Date(p.data).getTime() - new Date(anterior.data).getTime()) / (1000 * 60 * 60 * 24)
    );
    const gmd = dias > 0 ? (p.peso_kg - anterior.peso_kg) / dias : null;
    return { pesagem: p, gmdDesdeAnterior: gmd, diasDesdeAnterior: Math.round(dias) };
  });
}

function formatDataCompleta(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function AnimalHistoricoScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'AnimalHistorico'>>();
  const unidade: Unidade = useAppStore((s) => s.unidade);

  const [animal, setAnimal] = useState<AnimalRow | null>(null);
  const [pesagens, setPesagens] = useState<PesagemRow[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const a = await animaisRepo.getAnimal(route.params.animalId);
    setAnimal(a);
    if (a) {
      const lista = await pesagensRepo.listByAnimal(a.id);
      setPesagens(lista);
    }
    setCarregando(false);
  }, [route.params.animalId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const linhas = useMemo(() => calcularLinhas(pesagens), [pesagens]);

  const pontos: ChartPoint[] = useMemo(() => {
    return pesagens.map((p) => ({
      x: new Date(p.data),
      y: unidade === 'kg' ? p.peso_kg : p.peso_arroba,
    }));
  }, [pesagens, unidade]);

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!animal) {
    return (
      <View style={styles.center}>
        <Text style={styles.vazio}>Animal não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.codigo}>Animal {animal.codigo}</Text>
        <Text style={styles.subtitulo}>
          {pesagens.length} pesagem{pesagens.length === 1 ? '' : 's'} registrada
          {pesagens.length === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Evolução do peso</Text>
        <LineChart points={pontos} sufixo={labelPeso(unidade)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Pesagens</Text>
        <View style={styles.headerRow}>
          <Text style={[styles.col, styles.colData, styles.headerTxt]}>Data</Text>
          <Text style={[styles.col, styles.colPeso, styles.headerTxt]}>Peso</Text>
          <Text style={[styles.col, styles.colGmd, styles.headerTxt]}>GMD</Text>
        </View>
        {linhas.length === 0 ? (
          <Text style={styles.vazio}>Nenhuma pesagem ainda.</Text>
        ) : (
          linhas
            .slice()
            .reverse()
            .map(({ pesagem, gmdDesdeAnterior, diasDesdeAnterior }) => {
              const gmdExibido =
                gmdDesdeAnterior == null
                  ? '—'
                  : `${(unidade === 'kg' ? gmdDesdeAnterior : gmdDesdeAnterior / 15).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${labelGMD(unidade)}${diasDesdeAnterior != null ? ` (${diasDesdeAnterior}d)` : ''}`;
              return (
                <View key={pesagem.id} style={styles.linha}>
                  <Text style={[styles.col, styles.colData]}>
                    {formatDataCompleta(pesagem.data)}
                  </Text>
                  <Text style={[styles.col, styles.colPeso]}>
                    {formatPeso(pesagem.peso_kg, pesagem.peso_arroba, unidade)}
                  </Text>
                  <Text style={[styles.col, styles.colGmd]}>{gmdExibido}</Text>
                </View>
              );
            })
        )}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  header: { gap: 4 },
  codigo: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitulo: {
    ...typography.body,
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
  headerRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTxt: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  linha: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  col: {
    ...typography.body,
    color: colors.textPrimary,
  },
  colData: { flex: 1.2 },
  colPeso: { flex: 1 },
  colGmd: { flex: 1.4 },
  vazio: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
