import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { Signal, useTrading } from '@/context/TradingContext';

type FilterStatus = 'ALL' | 'OPEN' | 'WIN' | 'LOSS' | 'PENDING';

const STATUS_FILTERS: FilterStatus[] = ['ALL', 'OPEN', 'WIN', 'LOSS', 'PENDING'];

export default function SinyalScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { signals } = useTrading();
  const [filter, setFilter] = useState<FilterStatus>('ALL');

  const scale = width / 390;
  const fs = (base: number) => Math.round(base * Math.max(0.8, Math.min(1.1, scale)));

  const filtered = filter === 'ALL' ? signals : signals.filter(s => s.status === filter);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: fs(13) }]}>
          ✦ ZIGZAG_FIBO ✦
        </Text>
        <Text style={[styles.headerSub, { fontSize: fs(11) }]}>
          Sinyal Trading
        </Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterChip,
              filter === f && styles.filterChipActive,
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterText,
              { fontSize: fs(9) },
              filter === f && styles.filterTextActive,
            ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Signal count */}
      <View style={styles.countRow}>
        <Text style={[styles.countText, { fontSize: fs(10) }]}>
          {filtered.length} sinyal ditemukan
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        scrollEnabled={filtered.length > 0}
        renderItem={({ item }) => <SignalCard signal={item} fs={fs} width={width} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={32} color="#333" />
            <Text style={[styles.emptyText, { fontSize: fs(12) }]}>
              Tidak ada sinyal
            </Text>
          </View>
        }
      />
    </View>
  );
}

function SignalCard({
  signal,
  fs,
  width,
}: {
  signal: Signal;
  fs: (n: number) => number;
  width: number;
}) {
  const isBuy = signal.type === 'BUY';
  const typeColor = isBuy ? colors.light.buy : colors.light.sell;

  const statusColor =
    signal.status === 'WIN' ? colors.light.buy :
    signal.status === 'LOSS' ? colors.light.sell :
    signal.status === 'OPEN' ? '#f0c040' :
    '#888';

  const pnlColor = signal.pnl > 0 ? colors.light.buy : signal.pnl < 0 ? colors.light.sell : '#888';

  return (
    <View style={[styles.card, { borderLeftColor: typeColor, borderLeftWidth: 3 }]}>
      {/* Row 1: type + tf + time + status */}
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor + '22' }]}>
          <Text style={[styles.typeText, { fontSize: fs(11), color: typeColor }]}>
            {signal.type}
          </Text>
        </View>
        <Text style={[styles.tfText, { fontSize: fs(10) }]}>{signal.tf}</Text>
        <Text style={[styles.timeText, { fontSize: fs(9) }]}>{signal.time}</Text>
        <View style={[styles.statusBadge, { borderColor: statusColor }]}>
          <Text style={[styles.statusText, { fontSize: fs(9), color: statusColor }]}>
            {signal.status}
          </Text>
        </View>
      </View>

      {/* Row 2: Entry / TP / SL */}
      <View style={styles.priceRow}>
        <PriceItem label="Entry" value={signal.entry.toFixed(3)} color="#e0e0e0" fs={fs} />
        <PriceItem label="TP" value={signal.tp.toFixed(3)} color={colors.light.buy} fs={fs} />
        <PriceItem label="SL" value={signal.sl.toFixed(3)} color={colors.light.sell} fs={fs} />
        <PriceItem
          label="P&L"
          value={`${signal.pnl >= 0 ? '+' : ''}${signal.pnl.toFixed(1)}`}
          color={pnlColor}
          fs={fs}
        />
      </View>
    </View>
  );
}

function PriceItem({
  label,
  value,
  color,
  fs,
}: {
  label: string;
  value: string;
  color: string;
  fs: (n: number) => number;
}) {
  return (
    <View style={styles.priceItem}>
      <Text style={[styles.priceLabel, { fontSize: fs(8) }]}>{label}</Text>
      <Text style={[styles.priceValue, { fontSize: fs(11), color }]}>{value}</Text>
    </View>
  );
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: '#0d0d0d',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterChipActive: {
    backgroundColor: '#f0c040',
    borderColor: '#f0c040',
  },
  filterText: {
    color: '#888',
    fontFamily: 'Inter_500Medium',
  },
  filterTextActive: {
    color: '#000',
  },
  countRow: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0a0a0a',
  },
  countText: {
    color: '#555',
    fontFamily: 'Inter_400Regular',
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontFamily: 'Inter_700Bold',
  },
  tfText: {
    color: '#aaa',
    fontFamily: 'Inter_500Medium',
  },
  timeText: {
    color: '#666',
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    color: '#666',
    fontFamily: 'Inter_400Regular',
    marginBottom: 2,
  },
  priceValue: {
    fontFamily: 'Inter_600SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    color: '#444',
    fontFamily: 'Inter_400Regular',
  },
});
