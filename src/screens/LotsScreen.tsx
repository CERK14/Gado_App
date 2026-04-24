import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { LoteCard } from '../components/LoteCard';
import { CreateLoteSheet } from './lotes/CreateLoteSheet';
import { DeleteLoteSheet } from './lotes/DeleteLoteSheet';
import { listLotesComStats, type LoteComStats } from '../db/analytics/loteStats';
import { animaisRepo } from '../db/repos';
import type { LoteRow } from '../db/types';
import { useAppStore } from '../store/appStore';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type DeleteTarget = {
  lote: LoteRow;
  qtdAnimais: number;
};

export function LotsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const unidade = useAppStore((s) => s.unidade);
  const metaGMD = useAppStore((s) => s.metaGMD);

  const [stats, setStats] = useState<LoteComStats[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const carregar = useCallback(async () => {
    const lista = await listLotesComStats(metaGMD);
    setStats(lista);
    setCarregando(false);
  }, [metaGMD]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function pedirExclusao(lote: LoteRow) {
    const qtd = await animaisRepo.countByLote(lote.id);
    setDeleteTarget({ lote, qtdAnimais: qtd });
  }

  async function handleRefresh() {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  }

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stats}
        keyExtractor={(item) => item.lote.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <LoteCard
            stats={item}
            unidade={unidade}
            onPress={() => navigation.navigate('LoteDetail', { loteId: item.lote.id })}
            onDelete={() => pedirExclusao(item.lote)}
          />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Button label="+ Criar novo lote" onPress={() => setShowCreate(true)} />
          </View>
        }
      />

      <CreateLoteSheet
        visible={showCreate}
        totalLotes={stats.length}
        onClose={() => setShowCreate(false)}
        onCreated={carregar}
      />

      <DeleteLoteSheet
        visible={deleteTarget !== null}
        alvo={deleteTarget?.lote ?? null}
        outrosLotes={stats.map((s) => s.lote).filter((l) => l.id !== deleteTarget?.lote.id)}
        qtdAnimais={deleteTarget?.qtdAnimais ?? 0}
        onClose={() => setDeleteTarget(null)}
        onDeleted={carregar}
      />
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🗂️</Text>
      <Text style={styles.emptyTitulo}>Nenhum lote ainda</Text>
      <Text style={styles.emptyTxt}>Crie seu primeiro lote para começar a pesar o gado.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.xl,
    flexGrow: 1,
  },
  sep: { height: spacing.md },
  footer: {
    marginTop: spacing.xl,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  emptyEmoji: { fontSize: 64 },
  emptyTitulo: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  emptyTxt: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
