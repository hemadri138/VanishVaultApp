import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { Card, palette, PrimaryButton, Screen } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/context/ToastContext';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const c = palette[theme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);
      if (!isFirebaseConfigured) throw new Error('Missing Firebase env values in Expo app.');
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(app)/dashboard');
    } catch (error) {
      if (error instanceof FirebaseError) showToast({ title: 'Login Failed', message: error.code, kind: 'error' });
      else if (error instanceof Error) showToast({ title: 'Login Failed', message: error.message, kind: 'error' });
      else showToast({ title: 'Login Failed', message: 'Try again.', kind: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen bg={c.bg}>
      <View style={styles.centered}>
        <Card color={c.card}>
          <Text style={[styles.title, { color: c.text }]}>Sign In</Text>
          <TextInput placeholder="Email" placeholderTextColor={c.muted} style={[styles.input, { color: c.text, borderColor: c.soft }]} autoCapitalize="none" value={email} onChangeText={setEmail} />
          <TextInput placeholder="Password" placeholderTextColor={c.muted} style={[styles.input, { color: c.text, borderColor: c.soft }]} secureTextEntry value={password} onChangeText={setPassword} />
          <PrimaryButton label={loading ? 'Signing in...' : 'Login'} onPress={login} loading={loading} color={c.primary} />
          <View style={styles.links}><Link href="/(auth)/forgot-password" style={{ color: c.primary }}>Forgot password?</Link></View>
          <View style={styles.links}><Link href="/(auth)/signup" style={{ color: c.primary }}>No account? Create one</Link></View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 10 },
  links: { marginTop: 12, alignItems: 'center' }
});
