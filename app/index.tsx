import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card, palette, PrimaryButton, Screen } from '@/components/ui';

export default function HomeScreen() {
  const { theme, toggleTheme } = useTheme();
  const c = palette[theme];

  return (
    <Screen bg={c.bg}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.centered}>
          <View style={styles.topRow}>
            <Text style={[styles.logo, { color: c.text }]}>VanishVault</Text>
            <Pressable onPress={toggleTheme}><Text style={{ color: c.primary }}>Theme</Text></Pressable>
          </View>

          <Card color={c.card}>
            <Text style={[styles.title, { color: c.text }]}>Private media sharing</Text>
            <Text style={[styles.subtitle, { color: c.muted }]}>Upload media, enforce expiry rules, and share secure view links.</Text>
            <View style={{ gap: 10, marginTop: 14 }}>
              <PrimaryButton label="Login" onPress={() => router.push('/(auth)/login')} color={c.primary} />
              <PrimaryButton label="Create Account" onPress={() => router.push('/(auth)/signup')} color={c.primary} />
            </View>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logo: { fontWeight: '800', fontSize: 26 },
  title: { fontWeight: '800', fontSize: 28, lineHeight: 34 },
  subtitle: { marginTop: 10, fontSize: 15, lineHeight: 21 }
});
