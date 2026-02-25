import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type ExpiryOption = '10m' | '1h' | '24h' | 'custom';

type Props = {
  value: ExpiryOption;
  customDateTime: string;
  onValueChange: (value: ExpiryOption) => void;
  onCustomChange: (value: string) => void;
  onDateResolved: (date: Date) => void;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  primaryColor: string;
  cardColor: string;
};

export function ExpirySelector({
  value,
  customDateTime,
  onValueChange,
  onCustomChange,
  onDateResolved,
  textColor,
  mutedColor,
  borderColor,
  primaryColor,
  cardColor
}: Props) {
  const resolvedDate = useMemo(() => {
    const now = Date.now();
    if (value === '10m') return new Date(now + 10 * 60 * 1000);
    if (value === '1h') return new Date(now + 60 * 60 * 1000);
    if (value === '24h') return new Date(now + 24 * 60 * 60 * 1000);

    const parsed = new Date(customDateTime);
    return Number.isNaN(parsed.valueOf()) ? new Date(now + 10 * 60 * 1000) : parsed;
  }, [value, customDateTime]);

  useEffect(() => {
    onDateResolved(resolvedDate);
  }, [onDateResolved, resolvedDate]);

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: textColor, fontSize: 14, fontWeight: '600' }}>Expiry Time</Text>
      <View style={styles.grid}>
        {[
          { key: '10m', label: '10 min' },
          { key: '1h', label: '1 hour' },
          { key: '24h', label: '24 hour' },
          { key: 'custom', label: 'Custom' }
        ].map((option) => {
          const active = value === option.key;
          return (
            <Pressable
              key={option.key}
              onPress={() => onValueChange(option.key as ExpiryOption)}
              style={[
                styles.option,
                { borderColor: active ? primaryColor : borderColor, backgroundColor: active ? `${primaryColor}22` : cardColor }
              ]}
            >
              <Text style={{ color: active ? primaryColor : mutedColor, fontWeight: '600' }}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {value === 'custom' && (
        <TextInput
          placeholder="YYYY-MM-DDTHH:mm:ss"
          placeholderTextColor={mutedColor}
          value={customDateTime}
          onChangeText={onCustomChange}
          style={[styles.input, { color: textColor, borderColor, backgroundColor: cardColor }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 90,
    alignItems: 'center'
  },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }
});
