import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) return <Text style={{ padding: 16 }}>Loading...</Text>;
  if (!user) return <Redirect href="/(auth)/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
