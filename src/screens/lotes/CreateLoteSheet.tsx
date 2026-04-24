import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { useAppStore } from '../../store/appStore';
import { lotesRepo } from '../../db/repos';
import { podeCriarLote } from '../../utils/freemium';
import { colors, radius, spacing, typography } from '../../theme';

type Props = {
  visible: boolean;
  totalLotes: number;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateLoteSheet({ visible, totalLotes, onClose, onCreated }: Props) {
  const [nome, setNome] = useState('');
  const [busy, setBusy] = useState(false);
  const plano = useAppStore((s) => s.plano);
  const pesoAbate = useAppStore((s) => s.pesoAbate);

  function fechar() {
    setNome('');
    onClose();
  }

  async function criar() {
    const check = podeCriarLote(plano, totalLotes);
    if (!check.permitido) {
      Alert.alert('Plano gratuito', check.mensagem);
      return;
    }
    if (nome.trim().length === 0) {
      Alert.alert('Criar lote', 'Dê um nome ao lote.');
      return;
    }
    setBusy(true);
    try {
      await lotesRepo.createLote({ nome: nome.trim(), peso_abate: pesoAbate });
      onCreated();
      fechar();
    } catch (e) {
      Alert.alert('Criar lote', e instanceof Error ? e.message : 'Falha ao criar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <BottomSheet visible={visible} titulo="Criar novo lote" onClose={fechar}>
      <View style={styles.form}>
        <Text style={styles.label}>Nome do lote</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Recria 2026"
          placeholderTextColor={colors.textSecondary}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={criar}
        />
        <Button label="Criar" onPress={criar} loading={busy} disabled={nome.trim().length === 0} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
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
});
