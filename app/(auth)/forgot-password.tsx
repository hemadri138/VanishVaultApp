import { FirebaseError } from 'firebase/app';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { Card, palette, PrimaryButton, Screen } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const c = palette[theme];
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const resetPassword = async () => {
    try {
      setLoading(true);
      if (!isFirebaseConfigured) throw new Error('Missing Firebase env values in Expo app.');
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Email Sent', 'Check your inbox for reset instructions.');
    } catch (error) {
      if (error instanceof FirebaseError) Alert.alert('Reset Failed', error.code);
      else if (error instanceof Error) Alert.alert('Reset Failed', error.message);
      else Alert.alert('Reset Failed', 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen bg={c.bg}>
      <Card color={c.card}>
        <Text style={[styles.title, { color: c.text }]}>Forgot Password</Text>
        <Text style={{ color: c.muted, marginBottom: 12 }}>Enter your account email to receive a reset link.</Text>
        <TextInput placeholder="Email" placeholderTextColor={c.muted} style={[styles.input, { color: c.text, borderColor: c.soft }]} autoCapitalize="none" value={email} onChangeText={setEmail} />
        <PrimaryButton label={loading ? 'Sending...' : 'Send reset link'} onPress={resetPassword} disabled={loading} color={c.primary} />
        <View style={styles.links}><Link href="/(auth)/login" style={{ color: c.primary }}>Back to login</Link></View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 10 },
  links: { marginTop: 12, alignItems: 'center' }
});
