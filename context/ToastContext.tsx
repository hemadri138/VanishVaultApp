import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastKind = 'success' | 'error' | 'info';

type ToastPayload = {
  title: string;
  message?: string;
  kind?: ToastKind;
  durationMs?: number;
};

type ToastState = {
  visible: boolean;
  title: string;
  message: string;
  kind: ToastKind;
};

type ToastContextValue = {
  showToast: (payload: ToastPayload) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => undefined
});

const BG_BY_KIND: Record<ToastKind, string> = {
  success: '#0f5132',
  error: '#8b1d3b',
  info: '#1f3f7a'
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    title: '',
    message: '',
    kind: 'info'
  });
  const anim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true
    }).start(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    });
  }, [anim]);

  const showToast = useCallback(
    ({ title, message, kind = 'info', durationMs = 2500 }: ToastPayload) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setToast({
        visible: true,
        title,
        message: message ?? '',
        kind
      });

      Animated.timing(anim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      }).start();

      timerRef.current = setTimeout(hideToast, durationMs);
    },
    [anim, hideToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast.visible && (
        <View pointerEvents="none" style={[styles.overlay, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Animated.View
            style={[
              styles.toast,
              { backgroundColor: BG_BY_KIND[toast.kind] },
              {
                opacity: anim,
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.title}>{toast.title}</Text>
            {!!toast.message && <Text style={styles.message}>{toast.message}</Text>}
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 16
  },
  toast: {
    width: '100%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6
  },
  title: { color: '#fff', fontWeight: '800', fontSize: 14 },
  message: { color: '#f3f6ff', marginTop: 4, fontSize: 13 }
});
