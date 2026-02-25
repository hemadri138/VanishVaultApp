import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  cardColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  dangerColor: string;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  cardColor,
  textColor,
  mutedColor,
  borderColor,
  dangerColor
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={[styles.dialog, { backgroundColor: cardColor, borderColor }]}>
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          <Text style={[styles.message, { color: mutedColor }]}>{message}</Text>
          <View style={styles.row}>
            <Pressable style={[styles.button, { borderColor }]} onPress={onCancel}>
              <Text style={{ color: textColor, fontWeight: '700' }}>{cancelLabel}</Text>
            </Pressable>
            <Pressable style={[styles.button, { backgroundColor: dangerColor }]} onPress={onConfirm}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    padding: 20
  },
  dialog: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16
  },
  title: { fontSize: 18, fontWeight: '800' },
  message: { marginTop: 8, fontSize: 14, lineHeight: 20 },
  row: { marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  button: {
    minHeight: 40,
    minWidth: 86,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
