import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  fileType: 'image' | 'video' | 'pdf';
  uri: string;
  viewerLabel: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  cardColor: string;
};

export function SecureViewer({ fileType, uri, viewerLabel, borderColor, textColor, mutedColor, cardColor }: Props) {
  const watermark = useMemo(() => `${viewerLabel} • ${new Date().toLocaleString()}`, [viewerLabel]);

  if (fileType === 'image') {
    return (
      <View style={[styles.wrap, { borderColor, backgroundColor: cardColor }]}> 
        <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        <View style={styles.overlay} pointerEvents="none">
          <Text style={[styles.overlayText, { color: '#ffffff88' }]}>{watermark}</Text>
        </View>
      </View>
    );
  }

  if (fileType === 'video') {
    return (
      <View style={[styles.wrap, { borderColor, backgroundColor: cardColor }]}> 
        <WebView
          source={{ uri }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction
          style={styles.webView}
        />
        <View style={styles.overlay} pointerEvents="none">
          <Text style={[styles.overlayText, { color: '#ffffff88' }]}>{watermark}</Text>
        </View>
      </View>
    );
  }

  if (fileType === 'pdf') {
    return (
      <View style={[styles.wrap, { borderColor, backgroundColor: cardColor }]}> 
        <WebView source={{ uri }} style={styles.webView} />
        <Text style={{ color: mutedColor, textAlign: 'center', paddingTop: 8 }}>Watermarked for {viewerLabel}</Text>
      </View>
    );
  }

  return <Text style={{ color: textColor }}>Unsupported file type</Text>;
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: 14, overflow: 'hidden', minHeight: 420 },
  image: { width: '100%', minHeight: 420, backgroundColor: '#00000022' },
  webView: { minHeight: 420 },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  overlayText: { fontSize: 16, fontWeight: '700' }
});
