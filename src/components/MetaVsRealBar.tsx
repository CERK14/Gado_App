import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type Props = {
  nome: string;
  cor: string;
  real: number;
  meta: number;
  sufixo: string;
};

const ALTURA = 20;

export function MetaVsRealBar({ nome, cor, real, meta, sufixo }: Props) {
  const maximo = Math.max(real, meta, 1);
  const realPct = Math.max(0, real) / maximo;
  const metaPct = Math.max(0, meta) / maximo;

  const atingiu = meta > 0 ? real >= meta : true;
  const diffPct = meta > 0 ? ((real - meta) / meta) * 100 : null;

  return (
    <View style={styles.item}>
      <View style={styles.header}>
        <View style={styles.esquerda}>
          <View style={[styles.dot, { backgroundColor: cor }]} />
          <Text style={styles.nome} numberOfLines={1}>{nome}</Text>
        </View>
        <Text style={[styles.diff, atingiu ? styles.diffOk : styles.diffRuim]}>
          {diffPct != null
            ? `${diffPct >= 0 ? '+' : ''}${diffPct.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`
            : '—'}
        </Text>
      </View>

      <View style={styles.trilho}>
        <View style={[styles.barReal, { width: `${realPct * 100}%`, backgroundColor: atingiu ? colors.primary : colors.statusAbaixo }]} />
        <View style={[styles.marcadorMeta, { left: `${metaPct * 100}%` }]} />
      </View>

      <View style={styles.rodape}>
        <Text style={styles.valor}>
          Real {real.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} {sufixo}
        </Text>
        <Text style={styles.metaTxt}>
          Meta {meta.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} {sufixo}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  esquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  nome: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    flex: 1,
  },
  diff: {
    ...typography.bodyStrong,
  },
  diffOk: { color: colors.primary },
  diffRuim: { color: colors.statusAbaixo },
  trilho: {
    height: ALTURA,
    backgroundColor: colors.weightScaleBg,
    borderRadius: radius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  barReal: {
    height: '100%',
    borderRadius: radius.sm,
  },
  marcadorMeta: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    width: 3,
    backgroundColor: colors.statusMeta,
    borderRadius: 2,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valor: { ...typography.caption, color: colors.textSecondary },
  metaTxt: { ...typography.caption, color: colors.textSecondary },
});
