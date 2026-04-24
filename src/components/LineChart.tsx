import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors, spacing, typography } from '../theme';

export type ChartPoint = {
  x: Date;
  y: number;
  rotulo?: string;
};

type Props = {
  points: ChartPoint[];
  sufixo?: string;
  altura?: number;
  cor?: string;
};

const PADDING = { top: 16, right: 12, bottom: 32, left: 40 };
const GRID_LINES = 4;

function formatData(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatValor(v: number): string {
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

export function LineChart({ points, sufixo, altura = 220, cor = colors.primary }: Props) {
  const [largura, setLargura] = useState(0);

  function handleLayout(e: LayoutChangeEvent) {
    setLargura(e.nativeEvent.layout.width);
  }

  if (points.length === 0) {
    return (
      <View style={[styles.empty, { height: altura }]} onLayout={handleLayout}>
        <Text style={styles.emptyTxt}>Sem dados ainda.</Text>
      </View>
    );
  }

  if (largura === 0) {
    return <View style={{ height: altura }} onLayout={handleLayout} />;
  }

  const xs = points.map((p) => p.x.getTime());
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;

  const plotW = largura - PADDING.left - PADDING.right;
  const plotH = altura - PADDING.top - PADDING.bottom;

  function xTo(t: number): number {
    if (points.length === 1) return PADDING.left + plotW / 2;
    return PADDING.left + ((t - xMin) / xSpan) * plotW;
  }

  function yTo(v: number): number {
    if (points.length === 1) return PADDING.top + plotH / 2;
    return PADDING.top + (1 - (v - yMin) / ySpan) * plotH;
  }

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xTo(p.x.getTime())} ${yTo(p.y)}`)
    .join(' ');

  const yTicks = Array.from({ length: GRID_LINES + 1 }, (_, i) => {
    const v = yMin + (ySpan * i) / GRID_LINES;
    return { v, y: yTo(v) };
  });

  return (
    <View onLayout={handleLayout}>
      <Svg width={largura} height={altura}>
        <G>
          {yTicks.map((t, i) => (
            <G key={i}>
              <Line
                x1={PADDING.left}
                y1={t.y}
                x2={largura - PADDING.right}
                y2={t.y}
                stroke={colors.border}
                strokeWidth={1}
              />
              <SvgText
                x={PADDING.left - 6}
                y={t.y + 4}
                fill={colors.textSecondary}
                fontSize={10}
                textAnchor="end"
              >
                {formatValor(t.v)}
              </SvgText>
            </G>
          ))}
        </G>

        <Path d={path} stroke={cor} strokeWidth={2.5} fill="none" />

        {points.map((p, i) => (
          <G key={i}>
            <Circle cx={xTo(p.x.getTime())} cy={yTo(p.y)} r={5} fill={cor} />
            <SvgText
              x={xTo(p.x.getTime())}
              y={altura - 12}
              fill={colors.textSecondary}
              fontSize={10}
              textAnchor="middle"
            >
              {p.rotulo ?? formatData(p.x)}
            </SvgText>
          </G>
        ))}
      </Svg>

      {sufixo ? <Text style={styles.sufixo}>{sufixo}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTxt: {
    ...typography.body,
    color: colors.textSecondary,
  },
  sufixo: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});
