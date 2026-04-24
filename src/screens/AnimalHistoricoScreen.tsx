import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { animaisRepo } from '../db/repos';
import type { AnimalRow } from '../db/types';
import { colors, spacing, typography } from '../theme';
import type { RootStackParamList } from '../navigation/types';

export function AnimalHistoricoScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'AnimalHistorico'>>();
  const [animal, setAnimal] = useState<AnimalRow | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      const row = await animaisRepo.getAnimal(route.params.animalId);
      setAnimal(row);
      setCarregando(false);
    })();
  }, [route.params.animalId]);

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
        <Text style={styles.msg}>Animal não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.codigo}>Animal {animal.codigo}</Text>
      <Text style={styles.msg}>
        Tabela de pesagens com GMD entre registros e gráfico de linha entram na Etapa 8.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.background, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  codigo: { ...typography.h1, color: colors.textPrimary },
  msg: { ...typography.body, color: colors.textSecondary },
});
