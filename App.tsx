import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initDatabase } from './src/db/sqlite';
import { logSupabaseStatus } from './src/services/supabase';
import { useAppStore } from './src/store/appStore';
import { colors, typography } from './src/theme';

export default function App() {
  const [ready, setReady] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        await useAppStore.getState().hydrateFromDb();
        logSupabaseStatus();
        setReady(true);
      } catch (e) {
        console.error('[app] falha no bootstrap', e);
        setErro(e instanceof Error ? e.message : 'Erro desconhecido');
      }
    })();
  }, []);

  if (erro) {
    return (
      <View style={styles.center}>
        <Text style={styles.erroTitulo}>Não foi possível iniciar</Text>
        <Text style={styles.erroMsg}>{erro}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  erroTitulo: {
    ...typography.h2,
    color: colors.statusAbaixo,
    marginBottom: 8,
  },
  erroMsg: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
