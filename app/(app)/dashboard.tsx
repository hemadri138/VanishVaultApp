import { deleteDoc, doc, onSnapshot, collection, orderBy, query, where } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { Redirect, router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FileCard } from '@/components/FileCard';
import { UploadCard } from '@/components/UploadCard';
import { Card, palette, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { db, storage } from '@/lib/firebase';
import { VaultFile } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function DashboardScreen() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const c = palette[theme];
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [filesLoaded, setFilesLoaded] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<VaultFile | null>(null);
  const profileName = user?.displayName?.trim() || user?.email?.split('@')[0] || 'User';
  const profileInitial = profileName.charAt(0).toUpperCase();

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
        showToast({ title: 'Load Failed', message: error.message, kind: 'error' });
      }
    );

    return () => unsub();
  }, [showToast, user]);

  const activeCount = useMemo(() => files.filter((f) => f.expiresAt.getTime() > Date.now()).length, [files]);

  const onDelete = async (file: VaultFile) => {
    try {
      await deleteObject(ref(storage, file.fileUrl));
    } catch {
      // ignore missing storage object
    }
    await deleteDoc(doc(db, 'files', file.id));
    showToast({ title: 'Deleted', message: `${file.fileName} removed.`, kind: 'success' });
  };

  const onCopy = async (id: string) => {
    const link = `vanishvault://view/${id}`;
    await Clipboard.setStringAsync(link);
    showToast({ title: 'Copied', message: 'Secure link copied to clipboard.', kind: 'success' });
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
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: c.text }]}>Dashboard</Text>
              <Text style={{ color: c.muted, marginTop: 2 }}>Hi, {profileName}</Text>
            </View>
            <Pressable onPress={() => router.push('/(app)/profile')} hitSlop={8} style={[styles.avatar, { borderColor: c.soft }]}>
              <Text style={[styles.avatarText, { color: c.primary }]}>{profileInitial}</Text>
            </Pressable>
          </View>
          <Text style={{ color: c.muted }}>{activeCount} active file(s), {files.length} total uploads.</Text>
        </Card>

        <View style={{ height: 12 }} />

        <UploadCard
          onUploadComplete={(id) => {
            const link = `vanishvault://view/${id}`;
            showToast({ title: 'Share link generated', message: link, kind: 'success', durationMs: 3500 });
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
            onDelete={(item) => setPendingDelete(item)}
            onCopy={onCopy}
            textColor={c.text}
            mutedColor={c.muted}
            borderColor={c.soft}
            cardColor={c.card}
            primaryColor={c.primary}
          />
        ))}
      </ScrollView>

      <ConfirmDialog
        visible={Boolean(pendingDelete)}
        title="Delete File?"
        message={
          pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.fileName}"? This cannot be undone.`
            : ''
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          onDelete(pendingDelete).catch((error) => {
            const message = error instanceof Error ? error.message : 'Could not delete file.';
            showToast({ title: 'Delete Failed', message, kind: 'error' });
          });
          setPendingDelete(null);
        }}
        cardColor={c.card}
        textColor={c.text}
        mutedColor={c.muted}
        borderColor={c.soft}
        dangerColor={c.danger}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: '800' },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff12'
  },
  avatarText: { fontSize: 16, fontWeight: '800' }
});
