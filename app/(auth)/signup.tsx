import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { Card, palette, PrimaryButton, Screen } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/context/ToastContext';

export default function SignupScreen() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const c = palette[theme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    try {
      setLoading(true);
      if (!isFirebaseConfigured) throw new Error('Missing Firebase env values in Expo app.');
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(app)/dashboard');
    } catch (error) {
      if (error instanceof FirebaseError) showToast({ title: 'Sign Up Failed', message: error.code, kind: 'error' });
      else if (error instanceof Error) showToast({ title: 'Sign Up Failed', message: error.message, kind: 'error' });
      else showToast({ title: 'Sign Up Failed', message: 'Try again.', kind: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen bg={c.bg}>
      <View style={styles.centered}>
        <Card color={c.card}>
          <Text style={[styles.title, { color: c.text }]}>Create Account</Text>
          <TextInput placeholder="Email" placeholderTextColor={c.muted} style={[styles.input, { color: c.text, borderColor: c.soft }]} autoCapitalize="none" value={email} onChangeText={setEmail} />
          <TextInput placeholder="Password" placeholderTextColor={c.muted} style={[styles.input, { color: c.text, borderColor: c.soft }]} secureTextEntry value={password} onChangeText={setPassword} />
          <PrimaryButton label={loading ? 'Creating...' : 'Sign up'} onPress={signup} loading={loading} color={c.primary} />
          <View style={styles.links}><Link href="/(auth)/login" style={{ color: c.primary }}>Have an account? Login</Link></View>
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
