import { doc, getDoc, updateDoc, increment, deleteDoc, arrayUnion } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref } from 'firebase/storage';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { CountdownTimer } from '@/components/CountdownTimer';
import { SecureViewer } from '@/components/SecureViewer';
import { palette, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/hooks/useTheme';
import { db, storage } from '@/lib/firebase';

type ViewerFile = {
  id: string;
  fileType: 'image' | 'video' | 'pdf';
  fileUrl: string;
  ownerId: string;
  expiresAt: Date;
  allowedEmails: string[];
  selfDestructAfterView: boolean;
  selfDestructAfter10Sec: boolean;
  views: number;
};

export default function SecureViewScreen() {
  const { fileId } = useLocalSearchParams<{ fileId: string }>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const c = palette[theme];
  const [status, setStatus] = useState<'loading' | 'blocked' | 'expired' | 'destroyed' | 'ready'>('loading');
  const [file, setFile] = useState<ViewerFile | null>(null);
  const [signedUrl, setSignedUrl] = useState('');

  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync().catch(() => undefined);
    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(() => undefined);
    };
  }, []);

  const loadFile = useCallback(async () => {
    if (!fileId) {
      setStatus('destroyed');
      return;
    }
    const refDoc = doc(db, 'files', fileId);
    const snap = await getDoc(refDoc);

    if (!snap.exists()) {
      setStatus('destroyed');
      return;
    }

    const data = snap.data();
    const nextFile: ViewerFile = {
      id: data.id,
      fileType: data.fileType,
      fileUrl: data.fileUrl,
      ownerId: data.ownerId,
      expiresAt: data.expiresAt.toDate(),
      allowedEmails: data.allowedEmails ?? [],
      selfDestructAfterView: Boolean(data.selfDestructAfterView),
      selfDestructAfter10Sec: Boolean(data.selfDestructAfter10Sec),
      views: data.views ?? 0
    };

    if (nextFile.expiresAt.getTime() <= Date.now()) {
      setStatus('expired');
      return;
    }

    const email = user?.email?.toLowerCase();
    const allowed = nextFile.allowedEmails.length === 0 || (email ? nextFile.allowedEmails.includes(email) : false) || user?.uid === nextFile.ownerId;
    if (!allowed) {
      setStatus('blocked');
      return;
    }

    if (nextFile.selfDestructAfterView && nextFile.views > 0) {
      setStatus('destroyed');
      return;
    }

    const url = await getDownloadURL(ref(storage, nextFile.fileUrl));
    setSignedUrl(url);
    setFile(nextFile);
    setStatus('ready');

    await updateDoc(refDoc, {
      views: increment(1),
      viewedBy: arrayUnion(email ?? 'public-link')
    });
  }, [fileId, user?.email, user?.uid]);

  const destroyNow = useCallback(async () => {
    if (!file) return;
    try {
      await deleteObject(ref(storage, file.fileUrl));
    } catch {
      // ignore missing object
    }
    await deleteDoc(doc(db, 'files', file.id));
    setStatus('destroyed');
  }, [file]);

  useEffect(() => {
    loadFile().catch(() => setStatus('blocked'));
  }, [loadFile]);

  useEffect(() => {
    if (!file?.selfDestructAfterView || status !== 'ready') return;
    destroyNow().catch(() => {
      showToast({ title: 'Self-destruct failed', message: 'Please refresh.', kind: 'error' });
    });
  }, [destroyNow, file?.selfDestructAfterView, showToast, status]);

  const viewerLabel = useMemo(() => user?.email ?? 'guest-viewer', [user?.email]);

  if (status === 'loading') return <Screen bg={c.bg}><Text style={{ color: c.text }}>Loading...</Text></Screen>;
  if (status === 'blocked') return <Screen bg={c.bg}><Text style={{ color: c.text }}>Access denied.</Text></Screen>;
  if (status === 'expired') return <Screen bg={c.bg}><Text style={{ color: c.text }}>This file has expired.</Text></Screen>;
  if (status === 'destroyed') return <Screen bg={c.bg}><Text style={{ color: c.text }}>This file has been destroyed.</Text></Screen>;

  return (
    <Screen bg={c.bg}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '800' }}>Secure Viewer</Text>
          {file?.selfDestructAfter10Sec && <CountdownTimer seconds={10} onComplete={destroyNow} color={c.danger} />}
        </View>

        <SecureViewer
          fileType={file!.fileType}
          uri={signedUrl}
          viewerLabel={viewerLabel}
          borderColor={c.soft}
          textColor={c.text}
          mutedColor={c.muted}
          cardColor={c.card}
        />

        <View style={{ marginTop: 12 }}>
          <Text style={{ color: c.primary }} onPress={() => router.back()}>Back</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
