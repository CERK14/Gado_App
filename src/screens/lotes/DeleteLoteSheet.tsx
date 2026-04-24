import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { animaisRepo, lotesRepo } from '../../db/repos';
import type { LoteRow } from '../../db/types';
import { colors, radius, spacing, typography } from '../../theme';

type Props = {
  visible: boolean;
  alvo: LoteRow | null;
  outrosLotes: LoteRow[];
  qtdAnimais: number;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteLoteSheet({ visible, alvo, outrosLotes, qtdAnimais, onClose, onDeleted }: Props) {
  const [destinoId, setDestinoId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const temAnimais = qtdAnimais > 0;
  const temOutros = outrosLotes.length > 0;
  const titulo = useMemo(() => alvo ? `Excluir lote "${alvo.nome}"` : 'Excluir lote', [alvo]);

  function fechar() {
    setDestinoId(null);
    onClose();
  }

  async function excluirVazio() {
    if (!alvo) return;
    setBusy(true);
    try {
      await lotesRepo.softDeleteLote(alvo.id);
      onDeleted();
      fechar();
    } catch (e) {
      Alert.alert('Excluir lote', e instanceof Error ? e.message : 'Falha ao excluir.');
    } finally {
      setBusy(false);
    }
  }

  async function excluirTudo() {
    if (!alvo) return;
    Alert.alert(
      'Excluir tudo',
      `Isso apaga o lote e ${qtdAnimais} animal(is). Tem certeza?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await animaisRepo.softDeleteAnimaisDoLote(alvo.id);
              await lotesRepo.softDeleteLote(alvo.id);
              onDeleted();
              fechar();
            } catch (e) {
              Alert.alert('Excluir lote', e instanceof Error ? e.message : 'Falha.');
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  }

  async function moverEExcluir() {
    if (!alvo || !destinoId) return;
    setBusy(true);
    try {
      await animaisRepo.moverAnimaisDeLote(alvo.id, destinoId);
      await lotesRepo.softDeleteLote(alvo.id);
      onDeleted();
      fechar();
    } catch (e) {
      Alert.alert('Excluir lote', e instanceof Error ? e.message : 'Falha.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <BottomSheet visible={visible} titulo={titulo} onClose={fechar}>
      {!temAnimais ? (
        <View style={styles.body}>
          <Text style={styles.info}>Este lote está vazio. Pode ser excluído.</Text>
          <Button label="Excluir" variant="secondary" onPress={excluirVazio} loading={busy} />
        </View>
      ) : (
        <View style={styles.body}>
          <Text style={styles.info}>
            Este lote tem {qtdAnimais} animal(is). Escolha o que fazer com eles.
          </Text>

          {temOutros ? (
            <>
              <Text style={styles.subTitulo}>Mover animais para outro lote</Text>
              <View style={styles.lista}>
                {outrosLotes.map((l) => {
                  const ativo = destinoId === l.id;
                  return (
                    <Pressable
                      key={l.id}
                      onPress={() => setDestinoId(l.id)}
                      style={[styles.opcao, ativo && styles.opcaoAtiva]}
                    >
                      <View style={[styles.dot, { backgroundColor: l.cor }]} />
                      <Text style={[styles.opcaoTxt, ativo && styles.opcaoTxtAtiva]}>{l.nome}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Button
                label="Mover animais e excluir lote"
                onPress={moverEExcluir}
                disabled={!destinoId}
                loading={busy && !!destinoId}
              />
            </>
          ) : (
            <Text style={styles.semOutros}>Não há outros lotes para receber os animais.</Text>
          )}

          <Button
            label="Excluir lote e animais"
            variant="secondary"
            onPress={excluirTudo}
            loading={busy && !destinoId}
          />
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.md },
  info: {
    ...typography.body,
    color: colors.textPrimary,
  },
  subTitulo: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  semOutros: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  lista: { gap: spacing.sm },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  opcaoAtiva: {
    borderColor: colors.primary,
    backgroundColor: colors.weightScaleBg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  opcaoTxt: {
    ...typography.body,
    color: colors.textPrimary,
  },
  opcaoTxtAtiva: {
    color: colors.primary,
    fontWeight: '600',
  },
});
