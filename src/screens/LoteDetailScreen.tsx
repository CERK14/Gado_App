import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { lotesRepo } from '../db/repos';
import type { LoteRow } from '../db/types';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

export function LoteDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'LoteDetail'>>();
  const [lote, setLote] = useState<LoteRow | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      const row = await lotesRepo.getLote(route.params.loteId);
      setLote(row);
      setCarregando(false);
    })();
  }, [route.params.loteId]);

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!lote) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>Lote não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.nome}>{lote.nome}</Text>
      <Text style={styles.msg}>Tabela de animais, ordenação, meta de abate editável e ações por animal entram na Etapa 7.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.background, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  nome: { ...typography.h1, color: colors.textPrimary },
  msg: { ...typography.body, color: colors.textSecondary },
});
