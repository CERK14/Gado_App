import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { pesagensRepo } from '../../db/repos';
import type { AnimalRow, LoteRow, PesagemRow } from '../../db/types';
import { useAppStore } from '../../store/appStore';
import { colors, radius, spacing, statusColor, typography } from '../../theme';
import { calcGMD, statusEmoji, statusGMD, statusLabel } from '../../utils/gmd';
import { formatPeso, labelGMD, type Unidade } from '../../utils/peso';
import type { StatusKey } from '../../theme/colors';

type Resumo = {
  gmd: number | null;
  status: StatusKey;
  dias: number;
  ganhoKg: number;
  ganhoEsperadoKg: number;
  ganhoReais: number | null;
};

type Props = {
  lote: LoteRow;
  animal: AnimalRow;
  pesagem: PesagemRow;
  ehPrimeira: boolean;
  outrosLotes: LoteRow[];
  onMover: (loteId: string) => void;
  onProximo: () => void;
};

export function ResultadoStep({ lote, animal, pesagem, ehPrimeira, outrosLotes, onMover, onProximo }: Props) {
  const unidade: Unidade = useAppStore((s) => s.unidade);
  const metaGMD = useAppStore((s) => s.metaGMD);
  const precoKg = useAppStore((s) => s.precoKg);
  const [resumo, setResumo] = useState<Resumo | null>(null);

  useEffect(() => {
    (async () => {
      const lista = await pesagensRepo.listByAnimal(animal.id);
      if (lista.length < 2) {
        setResumo(null);
        return;
      }
      const primeira = lista[0];
      const ultima = lista[lista.length - 1];
      const gmd = calcGMD(lista.map((p) => ({ peso_kg: p.peso_kg, data: p.data })));
      const dias = Math.max(
        1,
        Math.round(
          (new Date(ultima.data).getTime() - new Date(primeira.data).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      const ganhoKg = ultima.peso_kg - primeira.peso_kg;
      const ganhoEsperadoKg = metaGMD * dias;
      const ganhoReais = gmd != null && precoKg > 0 ? ganhoKg * precoKg : null;
      setResumo({
        gmd,
        status: statusGMD(gmd, metaGMD),
        dias,
        ganhoKg,
        ganhoEsperadoKg,
        ganhoReais,
      });
    })();
  }, [animal.id, metaGMD, precoKg]);

  const status: StatusKey = ehPrimeira ? 'sem-dados' : resumo?.status ?? 'sem-dados';
  const cor = statusColor[status];

  const pesoExibido = formatPeso(pesagem.peso_kg, pesagem.peso_arroba, unidade);

  const gmdExibido = useMemo(() => {
    if (!resumo || resumo.gmd == null) return '—';
    const v = unidade === 'kg' ? resumo.gmd : resumo.gmd / 15;
    return `${v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${labelGMD(unidade)}`;
  }, [resumo, unidade]);

  const ganhoExibido = useMemo(() => {
    if (!resumo) return '—';
    const vKg = resumo.ganhoKg;
    const vArroba = vKg / 15;
    return formatPeso(vKg, vArroba, unidade);
  }, [resumo, unidade]);

  const esperadoExibido = useMemo(() => {
    if (!resumo) return '—';
    const vKg = resumo.ganhoEsperadoKg;
    const vArroba = vKg / 15;
    return formatPeso(vKg, vArroba, unidade);
  }, [resumo, unidade]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={[styles.card, { borderColor: cor }]}>
        <View style={styles.headerRow}>
          <Text style={styles.emoji}>{statusEmoji(status)}</Text>
          <Text style={[styles.statusTxt, { color: cor }]}>{statusLabel(status)}</Text>
        </View>

        <Text style={styles.animal}>
          {animal.codigo} <Text style={styles.em}>em</Text> {lote.nome}
        </Text>

        <View style={styles.pesoBloco}>
          <Text style={styles.pesoLabel}>Peso registrado</Text>
          <Text style={styles.pesoValor}>{pesoExibido}</Text>
        </View>

        {ehPrimeira ? (
          <Text style={styles.aviso}>
            Primeira pesagem deste animal. GMD será calculado a partir da próxima.
          </Text>
        ) : (
          <View style={styles.tabela}>
            <Linha label="GMD atual" valor={gmdExibido} />
            <Linha label={`Ganho em ${resumo?.dias ?? 0} dia(s)`} valor={ganhoExibido} />
            <Linha label="Ganho esperado" valor={esperadoExibido} />
            {resumo?.ganhoReais != null ? (
              <Linha
                label="Valor estimado do ganho"
                valor={`R$ ${resumo.ganhoReais.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`}
              />
            ) : null}
          </View>
        )}
      </View>

      {outrosLotes.length > 0 ? (
        <View style={styles.moverBloco}>
          <Text style={styles.moverTitulo}>Separar este animal?</Text>
          <View style={styles.moverLista}>
            {outrosLotes.map((l) => (
              <Button
                key={l.id}
                label={`Mover para ${l.nome}`}
                variant="secondary"
                onPress={() => onMover(l.id)}
              />
            ))}
          </View>
        </View>
      ) : null}

      <Button label="Próximo animal" onPress={onProximo} />
    </ScrollView>
  );
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.linhaLabel}>{label}</Text>
      <Text style={styles.linhaValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: { fontSize: 22 },
  statusTxt: {
    ...typography.h2,
  },
  animal: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  em: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
  pesoBloco: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.weightScaleBg,
    borderRadius: radius.md,
  },
  pesoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  pesoValor: {
    ...typography.display,
    fontSize: 52,
    color: colors.textPrimary,
  },
  aviso: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  tabela: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linhaLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  linhaValor: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  moverBloco: { gap: spacing.sm },
  moverTitulo: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  moverLista: { gap: spacing.sm },
});
