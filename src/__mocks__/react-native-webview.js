// Mock for react-native-webview
import React from 'react';
import { View } from 'react-native';

const WebViewMock = ({ testID, onLoadStart, onLoadEnd, onError, onNavigationStateChange, style }) => {
  // Expose mock helpers for tests via global
  if (global.__webViewRef) {
    global.__webViewRef.triggerLoadStart = () => onLoadStart && onLoadStart();
    global.__webViewRef.triggerLoadEnd = () => onLoadEnd && onLoadEnd();
    global.__webViewRef.triggerError = () => onError && onError({ nativeEvent: { description: 'Network Error' } });
    global.__webViewRef.triggerNavState = (state) => onNavigationStateChange && onNavigationStateChange(state);
  }
  return <View testID={testID} style={style} />;
};

WebViewMock.displayName = 'WebView';

module.exports = { WebView: WebViewMock };
