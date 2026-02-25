import { deleteDoc, doc, onSnapshot, collection, orderBy, query, where } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { Redirect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FileCard } from '@/components/FileCard';
import { UploadCard } from '@/components/UploadCard';
import { Card, palette, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { db, storage } from '@/lib/firebase';
import { VaultFile } from '@/types';

export default function DashboardScreen() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const c = palette[theme];
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [filesLoaded, setFilesLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'files'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((item) => {
          const data = item.data();
          return {
            id: data.id,
            ownerId: data.ownerId,
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileType: data.fileType,
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
            expiresAt: data.expiresAt?.toDate?.() ?? new Date(),
            allowedEmails: data.allowedEmails ?? [],
            selfDestructAfterView: Boolean(data.selfDestructAfterView),
            selfDestructAfter10Sec: Boolean(data.selfDestructAfter10Sec),
            views: data.views ?? 0,
            viewedBy: data.viewedBy ?? []
          } as VaultFile;
        });
        setFiles(next);
        setFilesLoaded(true);
      },
      (error) => {
        setFilesLoaded(true);
        Alert.alert('Load Failed', error.message);
      }
    );

    return () => unsub();
  }, [user]);

  const activeCount = useMemo(() => files.filter((f) => f.expiresAt.getTime() > Date.now()).length, [files]);

  const onDelete = async (file: VaultFile) => {
    try {
      await deleteObject(ref(storage, file.fileUrl));
    } catch {
      // ignore missing storage object
    }
    await deleteDoc(doc(db, 'files', file.id));
  };

  const onCopy = async (id: string) => {
    const link = `vanishvault://view/${id}`;
    await Clipboard.setStringAsync(link);
    Alert.alert('Copied', 'Secure link copied to clipboard.');
  };

  if (loading) {
    return (
      <Screen bg={c.bg}>
        <Text style={{ color: c.text }}>Loading...</Text>
      </Screen>
    );
  }
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Screen bg={c.bg}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Card color={c.card}>
          <Text style={[styles.title, { color: c.text }]}>Dashboard</Text>
          <Text style={{ color: c.muted }}>{activeCount} active file(s), {files.length} total uploads.</Text>
        </Card>

        <View style={{ height: 12 }} />

        <UploadCard
          onUploadComplete={(id) => {
            const link = `vanishvault://view/${id}`;
            Alert.alert('Share link generated', link);
          }}
          textColor={c.text}
          mutedColor={c.muted}
          borderColor={c.soft}
          primaryColor={c.primary}
          cardColor={c.card}
        />

        <View style={{ height: 12 }} />

        {filesLoaded && files.length === 0 && (
          <Card color={c.card}>
            <Text style={{ color: c.text, fontWeight: '700' }}>No uploads yet</Text>
            <Text style={{ color: c.muted, marginTop: 6 }}>
              Upload a file above to generate your first secure link.
            </Text>
          </Card>
        )}

        {!filesLoaded && (
          <Card color={c.card}>
            <Text style={{ color: c.muted }}>Loading your files...</Text>
          </Card>
        )}

        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onDelete={onDelete}
            onCopy={onCopy}
            textColor={c.text}
            mutedColor={c.muted}
            borderColor={c.soft}
            cardColor={c.card}
            primaryColor={c.primary}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({ title: { fontSize: 22, fontWeight: '800' } });
