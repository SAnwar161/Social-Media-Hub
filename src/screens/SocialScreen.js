import React, { useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function SocialScreen({
  url,
  themeColor,
  label,
  platformKey,
  customUserAgent,
  iconName,
  iconLib,
}) {
  const webViewRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);

  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  const onRefresh = () => {
    setHasError(false);
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  // Back button support (Android)
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };
      if (Platform.OS === 'android') {
        const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => sub.remove();
      }
    }, [canGoBack])
  );

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'NOTIFICATION_STATUS') {
        DeviceEventEmitter.emit('PLATFORM_BADGE_UPDATE', {
          platformKey,
          count: data.hasNotifications ? 1 : 0,
        });
      }
    } catch (e) {}
  };

  const onShouldStartLoadWithRequest = (request) => {
    const { url } = request;
    // Allow standard web protocols and about:blank
    if (url.startsWith('http://') || url.startsWith('https://') || url === 'about:blank') {
      return true;
    }
    
    // Explicitly block deep links like intent://, snssdk1233:// (TikTok), twitter:// (X)
    // This forces the platform to stay inside our WebView.
    // We also make sure to clear the loading banner just in case this intent triggered onLoadStart.
    setIsLoading(false);
    clearLoadingTimeout();
    return false;
  };

  // Notification scraper — only run when this tab is focused
  const scraperJS = isFocused ? `
    (function() {
      try {
        const title = document.title;
        let hasNotifs = !!title.match(/\\((\\d+)\\)/);
        if (!hasNotifs) {
          const host = window.location.host;
          if (host.includes('whatsapp')) hasNotifs = !!document.querySelector('[data-icon="unread-count"]');
          else if (host.includes('facebook')) hasNotifs = !!document.querySelector('[aria-label*="notification" i]');
          else if (host.includes('tiktok')) hasNotifs = !!document.querySelector('[data-e2e="notification-badge"]');
          else if (host.includes('twitter') || host.includes('x.com')) hasNotifs = !!document.querySelector('[data-testid*="Notification"] [class*="Dot"]');
          else if (host.includes('instagram')) hasNotifs = !!document.querySelector('a[href*="direct/inbox"] div[class*="Dot"]');
        }
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NOTIFICATION_STATUS', hasNotifications: hasNotifs }));
      } catch(e) {}
    })(); true;
  ` : 'true;';

  // Inject CSS to hide download banners on load & Hijack window.open for Auth popups
  const initJS = `
    (function() {
      // Force mobile-friendly scaling even on Desktop UAs (fixes tiny TikTok layout)
      let meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        document.head.appendChild(meta);
      }
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

      // Hide banners
      const s = document.createElement('style');
      s.innerHTML = '.tiktok-app-banner,.app-banner,.download-banner,[class*="AppBanner"],[class*="SmartBanner"]{display:none!important}';
      document.head.appendChild(s);

      // Force popups to open in exactly this window (Critical for Google/FB Auth)
      window.open = function(url, windowName, windowFeatures) {
        window.location.href = url;
        return window;
      };

      // Force target="_blank" links to open in this window
      document.addEventListener('click', function(e) {
        const a = e.target.closest('a');
        if (a && a.getAttribute('target') === '_blank') {
          a.removeAttribute('target');
        }
      }, true);
    })(); true;
  `;

  const IconComponent = iconLib === 'FontAwesome5' ? FontAwesome5 : MaterialCommunityIcons;

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <IconComponent name={iconName || 'alert-circle-outline'} size={52} color={themeColor} />
        <Text style={styles.errorTitle}>Could not load {label}</Text>
        <Text style={styles.errorSub}>Check your internet connection and try again.</Text>
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: themeColor }]} onPress={onRefresh}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        key={refreshKey}
        source={{ uri: url }}
        originWhitelist={['*']}
        style={styles.webview}
        // Performance & Rendering
        androidLayerType="hardware"
        cacheEnabled={true}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        // Media
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Features
        setSupportMultipleWindows={false}
        javaScriptCanOpenWindowsAutomatically={false}
        // Identity
        userAgent={customUserAgent || undefined}
        // Injected scripts
        injectedJavaScript={initJS}
        injectedJavaScriptBeforeContentLoaded={initJS}
        // Events
        onLoadStart={() => { 
          setIsLoading(true); 
          setHasError(false); 
          clearLoadingTimeout();
          // Timeout failsafe to clear "Opening X" banners if WebView hangs on intents
          loadingTimeoutRef.current = setTimeout(() => {
            setIsLoading(false);
          }, 12000); // 12-second max loading banner
        }}
        onLoadEnd={() => {
          setIsLoading(false);
          clearLoadingTimeout();
        }}
        onError={() => { 
          setHasError(true); 
          setIsLoading(false); 
          clearLoadingTimeout();
        }}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onMessage={handleMessage}
        onRenderProcessGone={() => setRefreshKey(prev => prev + 1)}
        onContentProcessDidTerminate={() => setRefreshKey(prev => prev + 1)}
        onHttpError={(e) => {
          // Silently ignore 4xx/5xx that aren't fatal page loads
        }}
      />

      {/* Branded Loading Splash */}
      {isLoading && (
        <View style={[styles.loadingOverlay, { backgroundColor: themeColor + '15' }]}>
          <View style={[styles.loaderCard, { borderColor: themeColor + '40' }]}>
            <IconComponent name={iconName || 'web'} size={56} color={themeColor} />
            <Text style={[styles.loadingLabel, { color: themeColor }]}>{label}</Text>
            <ActivityIndicator size="small" color={themeColor} style={styles.spinner} />
            <Text style={styles.loadingHint}>Opening {label}…</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1 },

  // Branded loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1.5,
    paddingVertical: 36,
    paddingHorizontal: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingLabel: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 14,
    letterSpacing: 0.3,
  },
  spinner: { marginTop: 16 },
  loadingHint: { fontSize: 12, color: '#bbb', marginTop: 8 },

  // Error screen
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fafafa',
  },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginTop: 16 },
  errorSub: { fontSize: 13, color: '#888', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 13,
    borderRadius: 12,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
