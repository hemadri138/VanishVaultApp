import { signOut } from 'firebase/auth';
import { Redirect, router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, palette, PrimaryButton, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/hooks/useTheme';
import { auth } from '@/lib/firebase';

export default function ProfileScreen() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const c = palette[theme];
  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut(auth);
      showToast({ title: 'Signed out', message: 'You have been logged out.', kind: 'success' });
      router.replace('/(auth)/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not log out.';
      showToast({ title: 'Logout Failed', message, kind: 'error' });
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) return <Screen bg={c.bg}><Text style={{ color: c.text }}>Loading...</Text></Screen>;
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Screen bg={c.bg}>
      <View style={styles.wrap}>
        <Card color={c.card}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: c.text }]}>Profile</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={{ color: c.primary, fontWeight: '700' }}>Back</Text>
            </Pressable>
          </View>
          <Text style={{ color: c.muted, marginTop: 6 }}>{user.email ?? 'No email'}</Text>
          <View style={{ marginTop: 12, gap: 10 }}>
            <PrimaryButton
              label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              onPress={toggleTheme}
              color={c.primary}
            />
            <PrimaryButton
              label={loggingOut ? 'Logging out...' : 'Logout'}
              onPress={onLogout}
              loading={loggingOut}
              color={c.danger}
            />
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: '800' }
});
