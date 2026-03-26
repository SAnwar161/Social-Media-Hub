import React, { useRef, useState, useCallback, useEffect } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SocialScreen({ 
  url, 
  themeColor, 
  label, 
  platformKey, 
  customUserAgent, 
}) {
  const webViewRef = useRef(null);
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const loadingTimeoutRef = useRef(null);
  const scraperIntervalRef = useRef(null);

  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  const clearScraper = () => {
    if (scraperIntervalRef.current) {
      clearInterval(scraperIntervalRef.current);
      scraperIntervalRef.current = null;
    }
  };

  const startScraper = () => {
    clearScraper();
    
    // Scraper logic: 15s if focused, 90s if background (Power Save)
    const interval = isFocused ? 15000 : 90000;
    
    scraperIntervalRef.current = setInterval(() => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(getScraperJS());
      }
    }, interval);
  };

  // Re-start scraper whenever focus changes
  useEffect(() => {
    startScraper();
    return () => clearScraper();
  }, [isFocused]);

  // FINAL HARDENING: Component Unmount Cleanup
  useEffect(() => {
    return () => {
      clearLoadingTimeout();
      clearScraper();
    };
  }, []);

  const onRefresh = () => {
    clearLoadingTimeout();
    clearScraper();
    setRefreshKey(prev => prev + 1);
  };

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
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
      }
    }, [canGoBack])
  );

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'NOTIFICATION_STATUS') {
        DeviceEventEmitter.emit('PLATFORM_BADGE_UPDATE', { platformKey, count: data.hasNotifications ? 1 : 0 });
      } else if (data.type === 'CONSOLE_LOG') {
        // Reduced logging for performance
        if (data.level === 'error') console.log(`[WebView ${label}] Error: ${data.message}`);
      }
    } catch (e) {}
  };

  const onShouldStartLoadWithRequest = (request) => {
    if (request.url.startsWith('http://') || request.url.startsWith('https://')) return true;
    console.log(`[SocialScreen ${label}] Blocked deep-link: ${request.url}`);
    return false;
  };

  const isX = platformKey === 'x' || label === 'X';

  if (hasError && !isX) { 
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ff3b30" />
        <Text style={styles.errorText}>Could not load {label}</Text>
        <TouchableOpacity style={[styles.refreshButton, { backgroundColor: themeColor }]} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getScraperJS = () => `
    (function() {
      try {
        const host = window.location.host;
        const title = document.title;
        let hasNotifs = false;
        if (title.match(/\\((\\d+)\\)/)) hasNotifs = true;
        if (!hasNotifs) {
          if (host.includes('whatsapp')) hasNotifs = !!document.querySelector('[data-icon="unread-count"], .unread-count');
          else if (host.includes('facebook')) hasNotifs = !!document.querySelector('a[href*="/notifications"] span[class*="count"]');
          else if (host.includes('tiktok')) hasNotifs = !!document.querySelector('span[data-e2e="nav-badge-count"], [data-e2e="notification-badge"]');
          else if (host.includes('x.com') || host.includes('twitter')) hasNotifs = !!document.querySelector('[data-testid*="Notifications"] [class*="Dot"], [aria-label*="unread" i]');
          else if (host.includes('instagram')) hasNotifs = !!document.querySelector('a[href*="direct/inbox"] div[class*="Dot"]');
        }
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NOTIFICATION_STATUS', hasNotifications: hasNotifs }));
      } catch (e) {}
    })();
  `;

  // One-time initialization JS (CSS & Console)
  const initJS = `
    (function() {
      const style = document.createElement('style');
      style.innerHTML = \`.tiktok-app-banner, .app-banner, .download-banner { display: none !important; }\`;
      document.head.appendChild(style);
      
      const pipe = (l, m) => window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CONSOLE_LOG', level: l, message: m }));
      console.error = (...a) => pipe('error', a.join(' '));
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        key={refreshKey}
        source={{ uri: url }}
        style={styles.webview}
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
          clearLoadingTimeout();
          
          const timeoutDuration = isX ? 90000 : 45000;
          
          loadingTimeoutRef.current = setTimeout(() => {
            // Only show error if still loading after timeout
            if (isLoading) {
              setIsLoading(false);
              setHasError(true);
              console.log(`[SocialScreen ${label}] Loading Timeout Reached (${timeoutDuration}ms)`);
            }
          }, timeoutDuration);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
          clearLoadingTimeout();
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          // Silent logging for non-fatal errors (often blocked trackers/ads)
          console.log(`[WebView ${label}] Non-fatal Error: ${nativeEvent.description} (${nativeEvent.code})`);
          
          // Trigger error UI for critical navigation failures (net errors -1 to -15)
          if (nativeEvent.code <= -1 && nativeEvent.code >= -15) {
             setHasError(true);
             setIsLoading(false);
             clearLoadingTimeout();
          }
        }}
        domStorageEnabled={true}
        databaseEnabled={true}
        javaScriptEnabled={true}
        cacheEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onMessage={handleMessage}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log(`[WebView ${label}] HTTP Error: ${nativeEvent.statusCode} at ${nativeEvent.url}`);
        }}
        onRenderProcessGone={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log(`[WebView ${label}] Render Process Gone! Detail: ${nativeEvent.didCrash ? 'Crashed' : 'Killed'}`);
          setRefreshKey(prev => prev + 1); // Auto-recovery for crashes
        }}
        onContentProcessDidTerminate={() => {
          console.log(`[WebView ${label}] Content Process Terminated (OOM?)`);
          setRefreshKey(prev => prev + 1); // Auto-recovery
        }}
        injectedJavaScript={initJS}
        userAgent={customUserAgent || undefined}
        setSupportMultipleWindows={true}
        javaScriptCanOpenWindowsAutomatically={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        androidLayerType="hardware"
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={themeColor} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#333', marginVertical: 15, fontWeight: '500' },
  refreshButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  refreshButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
