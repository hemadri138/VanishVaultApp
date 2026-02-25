import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export function CountdownTimer({
  seconds,
  onComplete,
  color
}: {
  seconds: number;
  onComplete: () => void;
  color: string;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [onComplete]);

  return (
    <View style={{ backgroundColor: `${color}22`, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}>
      <Text style={{ color, fontSize: 12, fontWeight: '700' }}>Self-destruct in {remaining}s</Text>
    </View>
  );
}
