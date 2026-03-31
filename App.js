import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TabNavigator from './src/navigation/TabNavigator';
import OnboardingScreen, { HOME_PLATFORM_KEY, ONBOARDED_KEY } from './src/screens/OnboardingScreen';
import { navigationRef } from './src/services/NavigationService';

export default function App() {
  const [appState, setAppState] = useState('loading'); // 'loading' | 'onboarding' | 'ready'
  const [homePlatform, setHomePlatform] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [[, onboarded], [, savedPlatform]] = await AsyncStorage.multiGet([
          ONBOARDED_KEY,
          HOME_PLATFORM_KEY,
        ]);

        if (onboarded === 'true' && savedPlatform) {
          setHomePlatform(savedPlatform);
          setAppState('ready');
        } else {
          setAppState('onboarding');
        }
      } catch (e) {
        // If storage fails, go straight to app with default platform
        setAppState('ready');
      }
    };
    init();
  }, []);

  const handleOnboardingDone = (selectedPlatform) => {
    setHomePlatform(selectedPlatform);
    setAppState('ready');
  };

  // Show spinner while reading AsyncStorage (usually < 100ms)
  if (appState === 'loading') {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#1877F2" />
      </View>
    );
  }

  // First-launch onboarding
  if (appState === 'onboarding') {
    return (
      <SafeAreaProvider>
        <OnboardingScreen onDone={handleOnboardingDone} />
      </SafeAreaProvider>
    );
  }

  // Main app
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <TabNavigator initialPlatform={homePlatform} />
        <StatusBar style="auto" translucent={true} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
