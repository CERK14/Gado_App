import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type Props = {
  label: string;
  value: number;
  sufixo?: string;
  min?: number;
  max?: number;
  decimais?: number;
  onSave: (novo: number) => void | Promise<void>;
  hint?: string;
};

function parsePtBr(txt: string): number | null {
  const limpo = txt.replace(',', '.').trim();
  if (limpo === '') return null;
  const n = Number(limpo);
  if (!Number.isFinite(n)) return null;
  return n;
}

function formatar(n: number, decimais: number): string {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  });
}

export function NumberField({ label, value, sufixo, min, max, decimais = 2, onSave, hint }: Props) {
  const [texto, setTexto] = useState(formatar(value, decimais));
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setTexto(formatar(value, decimais));
  }, [value, decimais]);

  async function handleBlur() {
    setErro(null);
    const n = parsePtBr(texto);
    if (n == null) {
      setErro('Número inválido.');
      setTexto(formatar(value, decimais));
      return;
    }
    if (min != null && n < min) {
      setErro(`Mínimo ${min}.`);
      setTexto(formatar(value, decimais));
      return;
    }
    if (max != null && n > max) {
      setErro(`Máximo ${max}.`);
      setTexto(formatar(value, decimais));
      return;
    }
    if (n === value) {
      setTexto(formatar(n, decimais));
      return;
    }
    await onSave(n);
  }

  return (
    <View style={styles.row}>
      <View style={styles.labelCol}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      </View>
      <View style={styles.inputCol}>
        <TextInput
          style={styles.input}
          value={texto}
          onChangeText={setTexto}
          onBlur={handleBlur}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
        {sufixo ? <Text style={styles.sufixo}>{sufixo}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  labelCol: { flex: 1 },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  erro: {
    ...typography.caption,
    color: colors.statusAbaixo,
    marginTop: spacing.xs,
  },
  inputCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    minWidth: 96,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlign: 'right',
  },
  sufixo: {
    ...typography.body,
    color: colors.textSecondary,
    minWidth: 32,
  },
});
