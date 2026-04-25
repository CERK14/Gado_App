import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { animaisRepo, pesagensRepo } from '../../db/repos';
import type { AnimalRow, LoteRow, PesagemRow } from '../../db/types';
import { useAppStore } from '../../store/appStore';
import { podeCriarAnimal, podeRegistrarPesagem } from '../../utils/freemium';
import { colors, radius, spacing, typography } from '../../theme';
import { formatPeso, labelPeso, type Unidade } from '../../utils/peso';

export type AnimalSelecionado = {
  animal: AnimalRow | null;
  codigo: string;
};

type Props = {
  lote: LoteRow;
  contagemSessao: number;
  codigoInicial?: string;
  onCancelar: () => void;
  onBloqueio: (mensagem: string) => void;
  onRegistrado: (args: {
    animal: AnimalRow;
    pesagem: PesagemRow;
    ehPrimeira: boolean;
  }) => void;
};

function parsePtBr(txt: string): number | null {
  const limpo = txt.replace(',', '.').trim();
  if (limpo === '') return null;
  const n = Number(limpo);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function diasDesde(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function RegistrarAnimalStep({
  lote,
  contagemSessao,
  codigoInicial,
  onCancelar,
  onBloqueio,
  onRegistrado,
}: Props) {
  const unidade: Unidade = useAppStore((s) => s.unidade);
  const plano = useAppStore((s) => s.plano);
  const [codigo, setCodigo] = useState(codigoInicial ?? '');
  const [sugestoes, setSugestoes] = useState<AnimalRow[]>([]);
  const [animalSelecionado, setAnimalSelecionado] = useState<AnimalRow | null>(null);
  const [ultimaPesagem, setUltimaPesagem] = useState<PesagemRow | null>(null);
  const [peso, setPeso] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pesoRef = useRef<TextInput>(null);

  useEffect(() => {
    if (codigoInicial && codigo === codigoInicial) {
      void selecionarPorCodigo(codigoInicial);
    }
  }, []);

  useEffect(() => {
    setErro(null);
    if (animalSelecionado && animalSelecionado.codigo !== codigo) {
      setAnimalSelecionado(null);
      setUltimaPesagem(null);
    }
    if (codigo.trim().length === 0) {
      setSugestoes([]);
      return;
    }
    let cancelado = false;
    (async () => {
      const encontrados = await animaisRepo.buscarPorCodigoParcial(lote.id, codigo.trim());
      if (!cancelado) setSugestoes(encontrados);
    })();
    return () => {
      cancelado = true;
    };
  }, [codigo, lote.id]);

  async function selecionarPorCodigo(cod: string) {
    const existente = await animaisRepo.findByCodigoNoLote(lote.id, cod);
    if (existente) {
      await selecionarAnimal(existente);
    } else {
      setCodigo(cod);
    }
  }

  async function selecionarAnimal(a: AnimalRow) {
    setCodigo(a.codigo);
    setAnimalSelecionado(a);
    setSugestoes([]);
    const ult = await pesagensRepo.ultimaPesagem(a.id);
    setUltimaPesagem(ult);
    setTimeout(() => pesoRef.current?.focus(), 50);
  }

  async function registrar() {
    setErro(null);
    const valor = parsePtBr(peso);
    if (valor == null) {
      setErro('Informe um peso válido.');
      return;
    }

    setBusy(true);
    try {
      let animal = animalSelecionado;
      if (!animal) {
        const cod = codigo.trim();
        if (cod.length === 0) {
          setErro('Informe o código do animal ou deixe o autocomplete escolher.');
          setBusy(false);
          return;
        }
        animal = await animaisRepo.findByCodigoNoLote(lote.id, cod);
        if (!animal) {
          const totalAtivos = await animaisRepo.countAnimaisAtivos();
          const guardaAnimal = podeCriarAnimal(plano, totalAtivos);
          if (!guardaAnimal.permitido) {
            setBusy(false);
            onBloqueio(guardaAnimal.mensagem);
            return;
          }
          animal = await animaisRepo.createAnimal(lote.id, cod);
        }
      }

      const pesagemExistentes = await pesagensRepo.countByAnimal(animal.id);
      const guardaPesagem = podeRegistrarPesagem(plano, pesagemExistentes);
      if (!guardaPesagem.permitido) {
        setBusy(false);
        onBloqueio(guardaPesagem.mensagem);
        return;
      }

      const pesagem = await pesagensRepo.createPesagem({
        animal_id: animal.id,
        valor,
        unidade,
      });

      onRegistrado({ animal, pesagem, ehPrimeira: pesagemExistentes === 0 });
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao registrar.');
    } finally {
      setBusy(false);
    }
  }

  const podeRegistrar = parsePtBr(peso) != null && !busy;
  const sugestaoCriar =
    codigo.trim().length > 0 &&
    !animalSelecionado &&
    !sugestoes.some((s) => s.codigo.toLowerCase() === codigo.trim().toLowerCase());

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contador}>
          <Text style={styles.contadorTxt}>⚖️ {contagemSessao} pesados hoje</Text>
          <Pressable onPress={onCancelar} hitSlop={8}>
            <Text style={styles.trocar}>Trocar lote</Text>
          </Pressable>
        </View>

        <View style={styles.loteChip}>
          <View style={[styles.dot, { backgroundColor: lote.cor }]} />
          <Text style={styles.loteNome}>{lote.nome}</Text>
        </View>

        <View>
          <Text style={styles.label}>Código do animal</Text>
          <TextInput
            style={styles.input}
            value={codigo}
            onChangeText={setCodigo}
            placeholder="Digite ou escolha"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="next"
          />

          {sugestoes.length > 0 ? (
            <View style={styles.sugestoes}>
              {sugestoes.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => selecionarAnimal(s)}
                  style={({ pressed }) => [styles.sugestaoItem, pressed && styles.itemPressed]}
                >
                  <Text style={styles.sugestaoTxt}>{s.codigo}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {sugestaoCriar ? (
            <Pressable
              onPress={() => setAnimalSelecionado(null)}
              style={styles.criarHint}
            >
              <Text style={styles.criarHintTxt}>
                Vai criar um novo animal com código "{codigo.trim()}".
              </Text>
            </Pressable>
          ) : null}

          {animalSelecionado && ultimaPesagem ? (
            <View style={styles.ultimaPesagem}>
              <Text style={styles.ultimaPesagemTxt}>
                Última pesagem:{' '}
                {formatPeso(ultimaPesagem.peso_kg, ultimaPesagem.peso_arroba, unidade)}
                {' '}· há {diasDesde(ultimaPesagem.data)} dia(s)
              </Text>
            </View>
          ) : null}
        </View>

        <View>
          <Text style={styles.label}>{labelPeso(unidade)}</Text>
          <TextInput
            ref={pesoRef}
            style={styles.pesoInput}
            value={peso}
            onChangeText={setPeso}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={registrar}
          />
        </View>

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <Button
          label="Registrar"
          onPress={registrar}
          disabled={!podeRegistrar}
          loading={busy}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    flexGrow: 1,
  },
  contador: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contadorTxt: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  trocar: {
    ...typography.body,
    color: colors.primary,
  },
  loteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loteNome: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  pesoInput: {
    ...typography.display,
    color: colors.textPrimary,
    backgroundColor: colors.weightScaleBg,
    borderRadius: radius.md,
    textAlign: 'center',
    paddingVertical: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
  },
  sugestoes: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  sugestaoItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemPressed: { opacity: 0.7 },
  sugestaoTxt: {
    ...typography.body,
    color: colors.textPrimary,
  },
  criarHint: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.weightScaleBg,
    borderRadius: radius.sm,
  },
  criarHintTxt: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  ultimaPesagem: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.weightScaleBg,
    borderRadius: radius.sm,
  },
  ultimaPesagemTxt: {
    ...typography.body,
    color: colors.textPrimary,
  },
  erro: {
    ...typography.body,
    color: colors.statusAbaixo,
  },
});
