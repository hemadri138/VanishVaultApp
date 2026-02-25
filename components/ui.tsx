import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const palette = {
  dark: {
    bg: '#071126',
    card: '#111d34',
    soft: '#1a2a4a',
    text: '#f0f4ff',
    muted: '#9fb0cf',
    primary: '#37b3ff',
    danger: '#ff4d7a'
  },
  light: {
    bg: '#f2f7ff',
    card: '#ffffff',
    soft: '#dce8fb',
    text: '#0f1f3a',
    muted: '#5d6d8c',
    primary: '#0f8de6',
    danger: '#d7265d'
  }
};

export function Screen({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.screen, { backgroundColor: bg }]}>
      {children}
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
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
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
