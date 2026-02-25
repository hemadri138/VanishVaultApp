import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { VaultFile } from '@/types';

export function FileCard({
  file,
  onDelete,
  onCopy,
  textColor,
  mutedColor,
  borderColor,
  cardColor,
  primaryColor
}: {
  file: VaultFile;
  onDelete: (file: VaultFile) => void;
  onCopy: (id: string) => void;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  cardColor: string;
  primaryColor: string;
}) {
  const expired = file.expiresAt.getTime() <= Date.now();

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}> 
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: textColor }]}>{file.fileName}</Text>
          <Text style={{ color: mutedColor, textTransform: 'uppercase', fontSize: 11 }}>{file.fileType}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={() => onCopy(file.id)}><Text style={{ color: primaryColor }}>Copy</Text></Pressable>
          <Pressable onPress={() => onDelete(file)}><Text style={{ color: '#ff6b89' }}>Delete</Text></Pressable>
        </View>
      </View>
      <View style={{ marginTop: 10, gap: 5 }}>
        <Text style={{ color: expired ? '#ff6b89' : '#3fdd9d', fontSize: 12 }}>
          {expired ? 'Expired' : `Expires ${file.expiresAt.toLocaleString()}`}
        </Text>
        <Text style={{ color: mutedColor, fontSize: 12 }}>Views: {file.views}</Text>
        <Text style={{ color: mutedColor, fontSize: 12 }}>Viewed by: {file.viewedBy.join(', ') || 'No viewers yet'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontWeight: '700', fontSize: 15 },
  actions: { gap: 8, alignItems: 'flex-end' }
});
