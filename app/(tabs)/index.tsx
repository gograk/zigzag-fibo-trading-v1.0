import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { useTrading } from '@/context/TradingContext';

const TIMEFRAMES = ['5M', '15M', '30M', '1H', '4H'] as const;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { symbol, price, priceChange, rsiData, stats, logs } = useTrading();

  const isSmall = width < 360;
  const scale = width / 390;
  const fs = (base: number) => Math.round(base * Math.max(0.8, Math.min(1.1, scale)));

  const pricePositive = priceChange >= 0;

  // Proportional layout heights
  const headerH = fs(42);
  const priceCardH = fs(110);
  const rsiCardH = fs(80);
  const statsCardH = fs(140);
  // Log takes remaining space
  const bottomBar = 48 + (insets.bottom || 0);
  const logH = Math.max(
    80,
    height - insets.top - headerH - priceCardH - rsiCardH - statsCardH - bottomBar - 32,
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.light.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4, height: headerH + insets.top }]}>
        <Text style={[styles.headerBrand, { fontSize: fs(12) }]}>
          ✦ ZIGZAG_FIBO ✦
        </Text>
        <Text style={[styles.headerPair, { fontSize: fs(12) }]}>
          {symbol} : ZigZag+Fibo
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Price Card */}
        <View style={[styles.priceCard, { minHeight: priceCardH }]}>
          <Text style={[styles.wsLabel, { fontSize: fs(10) }]}>WS COT LIVE</Text>
          <Text style={[styles.priceSymbol, { fontSize: fs(13) }]}>{symbol}</Text>
          <Text style={[styles.priceValue, { fontSize: fs(36) }]}>
            {price.toFixed(3)}
          </Text>
          <Text style={[
            styles.priceChange,
            { fontSize: fs(12), color: pricePositive ? colors.light.buy : colors.light.sell },
          ]}>
            {pricePositive ? '+' : ''}{priceChange.toFixed(3)}
          </Text>
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* RSI Section */}
        <View style={[styles.card, { minHeight: rsiCardH }]}>
          <Text style={[styles.sectionLabel, { fontSize: fs(10) }]}>
            RSI-14 per Timeframe
          </Text>
          <View style={styles.rsiRow}>
            {TIMEFRAMES.map(tf => {
              const rsi = rsiData[tf];
              const rsiColor =
                rsi >= 70 ? colors.light.sell :
                rsi <= 30 ? colors.light.buy :
                colors.light.neutral;
              return (
                <View key={tf} style={styles.rsiCell}>
                  <Text style={[styles.rsiTf, { fontSize: fs(9) }]}>{tf}</Text>
                  <Text style={[styles.rsiVal, { fontSize: fs(14), color: rsiColor }]}>
                    {rsi.toFixed(0)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.separator} />

        {/* Stats */}
        <View style={[styles.card, { minHeight: statsCardH }]}>
          <Text style={[styles.sectionLabel, { fontSize: fs(10) }]}>Statistik Sosial</Text>
          <View style={styles.statsGrid}>
            <StatRow label="Total Sinyal" value={`${stats.totalSinyal}`} fs={fs} />
            <StatRow
              label="Win (%)"
              value={stats.totalSinyal > 0
                ? `${stats.win} (${((stats.win / stats.totalSinyal) * 100).toFixed(0)}%)`
                : '0 (-)'}
              valueColor={colors.light.buy}
              fs={fs}
            />
            <StatRow
              label="Loss (%)"
              value={stats.totalSinyal > 0
                ? `${stats.loss} (${((stats.loss / stats.totalSinyal) * 100).toFixed(0)}%)`
                : '0 (-)'}
              valueColor={colors.light.sell}
              fs={fs}
            />
            <StatRow
              label="P&L Harian"
              value={`${stats.plHarian >= 0 ? '+' : ''}${stats.plHarian.toFixed(2)}`}
              valueColor={stats.plHarian >= 0 ? colors.light.buy : colors.light.sell}
              fs={fs}
            />
            <StatRow label="Max Drawdown" value={`${stats.maxDrawdown.toFixed(2)}`} fs={fs} />
            <StatRow label="Uptime" value={stats.uptime} fs={fs} />
          </View>
        </View>

        <View style={styles.separator} />

        {/* Log */}
        <View style={[styles.card, { minHeight: Math.min(logH, 160) }]}>
          <Text style={[styles.sectionLabel, { fontSize: fs(10) }]}>Log</Text>
          <ScrollView
            style={{ maxHeight: Math.min(logH - 24, 120) }}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {logs.map((entry, i) => (
              <Text
                key={i}
                style={[styles.logText, {
                  fontSize: fs(9),
                  color: entry.type === 'warn' ? '#ff9800' : entry.type === 'error' ? colors.light.sell : '#888',
                }]}
                numberOfLines={1}
              >
                [{entry.time}] {entry.message}
              </Text>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

function StatRow({
  label,
  value,
  valueColor,
  fs,
}: {
  label: string;
  value: string;
  valueColor?: string;
  fs: (n: number) => number;
}) {
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { fontSize: fs(10) }]}>{label}</Text>
      <Text style={[styles.statValue, { fontSize: fs(10), color: valueColor ?? colors.light.neutral }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    backgroundColor: '#0d0d0d',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerBrand: {
    color: '#f0c040',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  headerPair: {
    color: '#aaa',
    fontFamily: 'Inter_400Regular',
  },
  priceCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
  },
  wsLabel: {
    color: '#f0c040',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1,
    marginBottom: 2,
  },
  priceSymbol: {
    color: '#888',
    fontFamily: 'Inter_400Regular',
    marginBottom: 2,
  },
  priceValue: {
    color: '#f0f0f0',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  priceChange: {
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 0,
  },
  card: {
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionLabel: {
    color: '#888',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  rsiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rsiCell: {
    alignItems: 'center',
    flex: 1,
  },
  rsiTf: {
    color: '#666',
    fontFamily: 'Inter_400Regular',
    marginBottom: 2,
  },
  rsiVal: {
    fontFamily: 'Inter_700Bold',
  },
  statsGrid: {
    gap: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  statLabel: {
    color: '#888',
    fontFamily: 'Inter_400Regular',
  },
  statValue: {
    fontFamily: 'Inter_500Medium',
  },
  logText: {
    fontFamily: 'Inter_400Regular',
    marginBottom: 2,
  },
});
