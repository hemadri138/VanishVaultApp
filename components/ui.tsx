import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const palette = {
  dark: {
    bg: '#130f36',
    card: 'rgba(35, 25, 86, 0.58)',
    soft: 'rgba(170, 140, 255, 0.28)',
    text: '#f7f4ff',
    muted: '#c1b2ff',
    primary: '#9f82ff',
    danger: '#ff5f9b'
  },
  light: {
    bg: '#130f36',
    card: 'rgba(35, 25, 86, 0.58)',
    soft: 'rgba(170, 140, 255, 0.28)',
    text: '#f7f4ff',
    muted: '#c1b2ff',
    primary: '#9f82ff',
    danger: '#ff5f9b'
  }
};

export function Screen({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.screen, { backgroundColor: bg }]}>
      <View pointerEvents="none" style={styles.bgLayer}>
        <View style={[styles.glow, styles.glowTop]} />
        <View style={[styles.glow, styles.glowBottom]} />
        {Array.from({ length: 9 }).map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridV, { left: `${(i + 1) * 10}%` }]} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridH, { top: `${(i + 1) * 11}%` }]} />
        ))}
        <View style={styles.shieldAura} />
        <View style={styles.lockPlate}>
          <View style={styles.lockDot} />
        </View>
      </View>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

export function Card({ children, color }: { children: React.ReactNode; color: string }) {
  return <View style={[styles.card, { backgroundColor: color }]}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  color
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  color: string;
}) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, opacity: isDisabled ? 0.6 : pressed ? 0.88 : 1 }
      ]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingVertical: 16 },
  content: { flex: 1 },
  bgLayer: {
    ...StyleSheet.absoluteFillObject
  },
  glow: {
    position: 'absolute',
    borderRadius: 999
  },
  glowTop: {
    width: 280,
    height: 280,
    right: -80,
    top: -80,
    backgroundColor: '#7f57ff44'
  },
  glowBottom: {
    width: 260,
    height: 260,
    left: -90,
    bottom: -100,
    backgroundColor: '#6f9cff22'
  },
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#ffffff12'
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#ffffff10'
  },
  shieldAura: {
    position: 'absolute',
    top: 90,
    left: '50%',
    marginLeft: -90,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: '#8f6eff30'
  },
  lockPlate: {
    position: 'absolute',
    top: 150,
    left: '50%',
    marginLeft: -26,
    width: 52,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f8f2ffbb',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lockDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#6433d7'
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffffff26',
    shadowColor: '#2d1c63',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5
  },
  button: {
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' }
});
