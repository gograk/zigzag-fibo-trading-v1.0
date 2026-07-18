import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { GridIcon, SignalIcon, FiboIcon } from '@/components/TabIcons';

const GOLD = '#f0c040';
const INACTIVE = '#666';
const BG = '#0a0a0a';
const BORDER = '#1e1e1e';

const TABS = [
  { name: 'index',  title: 'Dashboard', Icon: GridIcon },
  { name: 'sinyal', title: 'Sinyal',    Icon: SignalIcon },
  { name: 'fibo',   title: 'Fibo',      Icon: FiboIcon },
];

function PremiumTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const iconSize = width < 360 ? 20 : 22;
  const labelSize = width < 360 ? 9 : 10;
  const barHeight = 56 + insets.bottom;

  return (
    <View style={[styles.bar, { height: barHeight, paddingBottom: insets.bottom }]}>
      {state.routes.map((route: any, i: number) => {
        const isFocused = state.index === i;
        const { Icon, title } = TABS[i];
        const color = isFocused ? GOLD : INACTIVE;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabItem}
          >
            {/* gold top line indicator */}
            <View style={[styles.indicator, isFocused && styles.indicatorActive]} />

            {/* icon background highlight */}
            <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
              <Icon color={color} size={iconSize} />
            </View>

            <Text style={[styles.label, { fontSize: labelSize, color }]}>
              {title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <PremiumTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map(tab => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    alignItems: 'flex-start',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 8,
    gap: 4,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  indicatorActive: {
    backgroundColor: GOLD,
  },
  iconWrap: {
    width: 40,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  iconWrapActive: {
    backgroundColor: '#211c0055',
  },
  label: {
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.4,
  },
});
