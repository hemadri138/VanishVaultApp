import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Timestamp, collection, doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { ExpirySelector } from '@/components/ExpirySelector';
import { PrimaryButton } from '@/components/ui';

function inferType(mimeType: string) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'pdf';
}

export function UploadCard({
  onUploadComplete,
  textColor,
  mutedColor,
  borderColor,
  primaryColor,
  cardColor
}: {
  onUploadComplete: (link: string) => void;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  primaryColor: string;
  cardColor: string;
}) {
  const { user } = useAuth();
  const [asset, setAsset] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [expiry, setExpiry] = useState<'10m' | '1h' | '24h' | 'custom'>('1h');
  const [customDateTime, setCustomDateTime] = useState('');
  const [resolvedDate, setResolvedDate] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [selfDestructAfterView, setSelfDestructAfterView] = useState(false);
  const [selfDestructAfter10Sec, setSelfDestructAfter10Sec] = useState(false);
  const [emails, setEmails] = useState('');
  const [uploading, setUploading] = useState(false);

  const allowedEmails = useMemo(
    () => emails.split(',').map((v) => v.trim().toLowerCase()).filter(Boolean),
    [emails]
  );

  const pick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
      type: ['image/*', 'video/*', 'application/pdf']
    });
    if (result.canceled) return;
    setAsset(result.assets[0]);
  };

  const removeSelectedFile = () => {
    setAsset(null);
  };

  const fetchWithTimeout = async (uri: string, timeoutMs: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(uri, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const upload = async () => {
    if (!asset) {
      Alert.alert('No file selected', 'Pick an image, video, or PDF first.');
      return;
    }
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in again and retry.');
      return;
    }

    setUploading(true);
    try {
      const response = await fetchWithTimeout(asset.uri, 30000);
      if (!response.ok) throw new Error('Could not read the selected file.');
      const blob = await response.blob();
      const fileId = doc(collection(db, 'files')).id;
      const path = `uploads/${user.uid}/${fileId}`;

      await uploadBytes(ref(storage, path), blob, { contentType: asset.mimeType ?? undefined });
      const downloadUrl = await getDownloadURL(ref(storage, path));

      await setDoc(doc(db, 'files', fileId), {
        id: fileId,
        ownerId: user.uid,
        fileUrl: path,
        fileName: asset.name,
        fileType: inferType(asset.mimeType ?? 'application/pdf'),
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(resolvedDate),
        allowedEmails,
        selfDestructAfterView,
        selfDestructAfter10Sec,
        views: 0,
        viewedBy: [],
        previewUrl: downloadUrl
      });

      onUploadComplete(fileId);
      setAsset(null);
      setEmails('');
      setSelfDestructAfter10Sec(false);
      setSelfDestructAfterView(false);
      Alert.alert('Upload complete', 'Secure link generated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      Alert.alert('Upload Failed', message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: `${cardColor}dd`, borderColor }]}> 
      <Text style={{ color: textColor, fontSize: 18, fontWeight: '700', marginBottom: 10 }}>Upload Media</Text>
      <Pressable onPress={pick} style={[styles.drop, { borderColor }]}> 
        <Text style={{ color: mutedColor }}>Pick image, video, or PDF</Text>
      </Pressable>

      {!!asset && (
        <View style={[styles.previewWrap, { backgroundColor: cardColor }]}> 
          <View style={styles.previewHeader}>
            <Text style={{ color: textColor, fontWeight: '600', marginBottom: 8, flex: 1 }}>{asset.name}</Text>
            <Pressable onPress={removeSelectedFile} hitSlop={8}>
              <Text style={{ color: '#ff6b89', fontWeight: '600' }}>Remove</Text>
            </Pressable>
          </View>
          {asset.mimeType?.startsWith('image/') && (
            <Image source={{ uri: asset.uri }} style={styles.previewImage} resizeMode="contain" />
          )}
          {asset.mimeType?.startsWith('video/') && (
            <Text style={{ color: mutedColor }}>Video selected and ready to upload.</Text>
          )}
          {asset.mimeType === 'application/pdf' && (
            <Text style={{ color: mutedColor }}>PDF selected and ready to upload.</Text>
          )}
        </View>
      )}

      <ScrollView style={{ marginTop: 12 }}>
        <ExpirySelector
          value={expiry}
          customDateTime={customDateTime}
          onValueChange={setExpiry}
          onCustomChange={setCustomDateTime}
          onDateResolved={setResolvedDate}
          textColor={textColor}
          mutedColor={mutedColor}
          borderColor={borderColor}
          primaryColor={primaryColor}
          cardColor={cardColor}
        />

        <Text style={{ color: textColor, marginTop: 12, marginBottom: 6, fontWeight: '600' }}>
          Restrict access emails (comma separated)
        </Text>
        <TextInput
          value={emails}
          onChangeText={setEmails}
          placeholder="alice@mail.com,bob@mail.com"
          placeholderTextColor={mutedColor}
          style={[styles.input, { color: textColor, borderColor, backgroundColor: cardColor }]}
        />

        <View style={styles.toggleRow}>
          <Text style={{ color: textColor }}>Self-destruct after first view</Text>
          <Switch value={selfDestructAfterView} onValueChange={setSelfDestructAfterView} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={{ color: textColor }}>Self-destruct after 10 seconds</Text>
          <Switch value={selfDestructAfter10Sec} onValueChange={setSelfDestructAfter10Sec} />
        </View>

        <PrimaryButton label={uploading ? 'Uploading...' : 'Upload & Generate Link'} onPress={upload} disabled={uploading || !asset} color={primaryColor} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 14 },
  drop: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    minHeight: 92,
    justifyContent: 'center',
    alignItems: 'center'
  },
  previewWrap: { borderRadius: 12, padding: 12, marginTop: 10 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewImage: { width: '100%', height: 220, borderRadius: 10, backgroundColor: '#00000022' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 }
});
