import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { SelecionarLoteStep } from './pesagem/SelecionarLoteStep';
import { RegistrarAnimalStep } from './pesagem/RegistrarAnimalStep';
import { ResultadoStep } from './pesagem/ResultadoStep';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { animaisRepo, lotesRepo } from '../db/repos';
import type { AnimalRow, LoteRow, PesagemRow } from '../db/types';
import { getLastLoteId, setLastLoteId } from '../utils/lastLote';
import { useAppStore } from '../store/appStore';
import { colors } from '../theme';
import type { TabsParamList } from '../navigation/types';

type Step = 'selecionar' | 'registrar' | 'resultado';

type ResultadoPayload = {
  lote: LoteRow;
  animal: AnimalRow;
  pesagem: PesagemRow;
  ehPrimeira: boolean;
};

export function WeighScreen() {
  const route = useRoute<RouteProp<TabsParamList, 'Pesar'>>();
  const navigation = useNavigation<BottomTabNavigationProp<TabsParamList, 'Pesar'>>();

  const [step, setStep] = useState<Step>('selecionar');
  const [lotes, setLotes] = useState<LoteRow[]>([]);
  const [loteAtivo, setLoteAtivo] = useState<LoteRow | null>(null);
  const [ultimoLoteId, setUltimoLoteId] = useState<string | null>(null);
  const [codigoInicial, setCodigoInicial] = useState<string | undefined>();
  const [resultado, setResultado] = useState<ResultadoPayload | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [bloqueio, setBloqueio] = useState<string | null>(null);
  const paramConsumido = useRef(false);

  const carregar = useCallback(async () => {
    const [lotesDb, lastId] = await Promise.all([lotesRepo.listLotes(), getLastLoteId()]);
    setLotes(lotesDb);
    setUltimoLoteId(lastId);
    setCarregando(false);
    return { lotesDb, lastId };
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  useEffect(() => {
    const params = route.params;
    if (!params || paramConsumido.current) return;
    paramConsumido.current = true;
    (async () => {
      const { lotesDb } = await carregar();
      const alvo = params.loteId ? lotesDb.find((l) => l.id === params.loteId) ?? null : null;
      if (alvo) {
        setLoteAtivo(alvo);
        setCodigoInicial(params.codigo);
        setStep('registrar');
      }
      navigation.setParams({ loteId: undefined, codigo: undefined });
    })();
  }, [route.params, carregar, navigation]);

  function irParaRegistrar(lote: LoteRow) {
    setLoteAtivo(lote);
    setCodigoInicial(undefined);
    setStep('registrar');
    setLastLoteId(lote.id).catch(() => {});
    setUltimoLoteId(lote.id);
  }

  function handleRegistrado(args: { animal: AnimalRow; pesagem: PesagemRow; ehPrimeira: boolean }) {
    if (!loteAtivo) return;
    setResultado({
      lote: loteAtivo,
      animal: args.animal,
      pesagem: args.pesagem,
      ehPrimeira: args.ehPrimeira,
    });
    setSessionCount((n) => n + 1);
    setStep('resultado');
  }

  async function handleMover(loteDestinoId: string) {
    if (!resultado) return;
    try {
      await animaisRepo.moveAnimal(resultado.animal.id, loteDestinoId);
      Alert.alert('Mover animal', 'Animal movido com sucesso.');
      proximoAnimal();
    } catch (e) {
      Alert.alert('Mover animal', e instanceof Error ? e.message : 'Falha ao mover.');
    }
  }

  function proximoAnimal() {
    setResultado(null);
    setCodigoInicial(undefined);
    setStep('registrar');
  }

  function trocarLote() {
    setResultado(null);
    setLoteAtivo(null);
    setCodigoInicial(undefined);
    setStep('selecionar');
  }

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (step === 'selecionar') {
    return (
      <View style={styles.container}>
        <SelecionarLoteStep
          lotes={lotes}
          ultimoLoteId={ultimoLoteId}
          onSelect={irParaRegistrar}
        />
      </View>
    );
  }

  if (step === 'registrar' && loteAtivo) {
    return (
      <View style={styles.container}>
        <RegistrarAnimalStep
          lote={loteAtivo}
          contagemSessao={sessionCount}
          codigoInicial={codigoInicial}
          onCancelar={trocarLote}
          onBloqueio={setBloqueio}
          onRegistrado={handleRegistrado}
        />
        <UpgradePrompt
          visible={bloqueio !== null}
          mensagem={bloqueio ?? ''}
          onClose={() => setBloqueio(null)}
        />
      </View>
    );
  }

  if (step === 'resultado' && resultado) {
    const outrosLotes = lotes.filter((l) => l.id !== resultado.lote.id);
    return (
      <View style={styles.container}>
        <ResultadoStep
          lote={resultado.lote}
          animal={resultado.animal}
          pesagem={resultado.pesagem}
          ehPrimeira={resultado.ehPrimeira}
          outrosLotes={outrosLotes}
          onMover={handleMover}
          onProximo={proximoAnimal}
        />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
