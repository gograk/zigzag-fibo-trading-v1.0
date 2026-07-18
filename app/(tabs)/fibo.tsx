import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { FiboLevel, TimeframeFibo, useTrading } from '@/context/TradingContext';

const TIMEFRAMES = ['5M', '15M', '30M', '1H', '4H'] as const;

export default function FiboScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { fiboData } = useTrading();
  const [selected, setSelected] = useState<string | null>(null);

  const scale = width / 390;
  const fs = (base: number) => Math.round(base * Math.max(0.8, Math.min(1.1, scale)));

  const displayData = selected
    ? fiboData.filter(d => d.tf === selected)
    : fiboData;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: fs(13) }]}>
          ✦ ZIGZAG_FIBO ✦
        </Text>
        <Text style={[styles.headerSub, { fontSize: fs(11) }]}>
          XAUUSD : ZigZag+Fibo
        </Text>
      </View>

      {/* TF selector */}
      <View style={styles.tfRow}>
        <TouchableOpacity
          onPress={() => setSelected(null)}
          style={[styles.tfChip, selected === null && styles.tfChipActive]}
          activeOpacity={0.7}
        >
          <Text style={[styles.tfChipText, { fontSize: fs(9) }, selected === null && styles.tfChipTextActive]}>
            ALL
          </Text>
        </TouchableOpacity>
        {TIMEFRAMES.map(tf => (
          <TouchableOpacity
            key={tf}
            onPress={() => setSelected(selected === tf ? null : tf)}
            style={[styles.tfChip, selected === tf && styles.tfChipActive]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tfChipText,
              { fontSize: fs(9) },
              selected === tf && styles.tfChipTextActive,
            ]}>
              {tf}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 8, gap: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {displayData.map(data => (
          <FiboCard key={data.tf} data={data} fs={fs} width={width} />
        ))}
      </ScrollView>
    </View>
  );
}

function FiboCard({
  data,
  fs,
  width,
}: {
  data: TimeframeFibo;
  fs: (n: number) => number;
  width: number;
}) {
  const dirColor = data.zigzagDir === 'UP' ? colors.light.buy : colors.light.sell;
  const dirArrow = data.zigzagDir === 'UP' ? '▲' : '▼';

  return (
    <View style={styles.card}>
      {/* TF Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.tfBadge, { borderColor: dirColor }]}>
          <Text style={[styles.tfLabel, { fontSize: fs(11), color: dirColor }]}>
            ZZ {data.tf} {dirArrow}
          </Text>
        </View>
        <View style={styles.hlContainer}>
          <Text style={[styles.hlText, { fontSize: fs(9) }]}>
            <Text style={{ color: colors.light.sell }}>H:</Text>
            <Text style={{ color: '#e0e0e0' }}>{data.high.toFixed(3)}  </Text>
            <Text style={{ color: colors.light.buy }}>L:</Text>
            <Text style={{ color: '#e0e0e0' }}>{data.low.toFixed(3)}</Text>
          </Text>
          <Text style={[styles.rsiLabel, { fontSize: fs(9) }]}>
            RSI <Text style={{ color: rsiColor(data.rsi) }}>{data.rsi.toFixed(0)}</Text>
          </Text>
        </View>
      </View>

      {/* Levels */}
      <View style={styles.levelsContainer}>
        {data.levels.map((level, i) => (
          <LevelRow key={i} level={level} fs={fs} isLast={i === data.levels.length - 1} />
        ))}
      </View>
    </View>
  );
}

function LevelRow({
  level,
  fs,
  isLast,
}: {
  level: FiboLevel;
  fs: (n: number) => number;
  isLast: boolean;
}) {
  const col = levelColor(level.type);
  return (
    <View style={[styles.levelRow, !isLast && styles.levelRowBorder]}>
      <Text style={[styles.levelLabel, { fontSize: fs(9), color: col }]} numberOfLines={1}>
        {level.label}
      </Text>
      <Text style={[styles.levelValue, { fontSize: fs(10), color: col }]}>
        {level.value.toFixed(3)}
      </Text>
    </View>
  );
}

function levelColor(type: FiboLevel['type']): string {
  switch (type) {
    case 'sell': return colors.light.sell;
    case 'buy': return colors.light.buy;
    case 'sl': return '#ff6b6b';
    case 'high': return '#e0e0e0';
    case 'mid': return '#e0e0e0';
    case 'low': return '#e0e0e0';
    default: return '#aaa';
  }
}

function rsiColor(rsi: number): string {
  if (rsi >= 70) return colors.light.sell;
  if (rsi <= 30) return colors.light.buy;
  return '#f0c040';
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    backgroundColor: '#0d0d0d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    color: '#f0c040',
    fontFamily: 'Inter_700Bold',
  },
  headerSub: {
    color: '#888',
    fontFamily: 'Inter_400Regular',
  },
  tfRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: '#0d0d0d',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  tfChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  tfChipActive: {
    backgroundColor: '#f0c040',
    borderColor: '#f0c040',
  },
  tfChipText: {
    color: '#888',
    fontFamily: 'Inter_500Medium',
  },
  tfChipTextActive: {
    color: '#000',
  },
  card: {
    backgroundColor: '#0f0f0f',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    marginBottom: 6,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  tfBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tfLabel: {
    fontFamily: 'Inter_700Bold',
  },
  hlContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  hlText: {
    fontFamily: 'Inter_400Regular',
  },
  rsiLabel: {
    color: '#666',
    fontFamily: 'Inter_400Regular',
  },
  levelsContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  levelRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#161616',
  },
  levelLabel: {
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  levelValue: {
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'right',
  },
});
